import { VinculoEmpregaticioPublico } from "@saas/shared";

export interface TokenPayload {
    readonly sid: string;
    readonly sub: string; 
    readonly email: string;
    readonly vinculoProps: VinculoEmpregaticioPublico[]
}