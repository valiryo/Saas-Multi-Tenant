import { 
  ArgumentsHost, 
  Catch, 
  ExceptionFilter, 
  HttpException 
} from "@nestjs/common";
import { Response, Request } from "express";
import { ErroDeDominio } from "@saas/shared";
import { DomainToHttpMapper } from "../mappers/domain-to-http.mapper";

@Catch(ErroDeDominio) 
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: ErroDeDominio, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpException: HttpException = DomainToHttpMapper.map(exception);
    
    const status = httpException.getStatus();
    const exceptionResponse = httpException.getResponse();

    const errorDetails = typeof exceptionResponse === 'object' && 'error' in exceptionResponse
      ? (exceptionResponse as any).error
      : httpException.name;

    response.status(status).json({
      statusCode: status,
      error: errorDetails,
      message: exception.message, 
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}