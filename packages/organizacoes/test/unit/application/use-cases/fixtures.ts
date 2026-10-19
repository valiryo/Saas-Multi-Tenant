import { vi } from "vitest";
import { Id, IRepositorioVinculoEmpregaticio, Result, TipoCargo, VinculoEmpregaticio } from "@saas/shared";
import { IRepositorioUsuario, Usuario } from "@saas/usuarios";
import { IRepositorioOrganizacao, Organizacao } from "../../../../src/domain";

export function novoId(): string {
    return Id.criar().resultado.valor;
}

export function criarOrganizacao(nome = "Empresa Teste"): Organizacao {
    const resultado = Organizacao.criar({ nome });
    if (resultado.isFalha) {
        throw resultado.falha;
    }
    return resultado.resultado;
}

export function criarVinculo(props: {
    organizacaoId: string;
    cargo: TipoCargo;
    usuarioId?: string;
    ativo?: boolean;
}): VinculoEmpregaticio {
    const resultado = VinculoEmpregaticio.criar({
        usuarioId: props.usuarioId ?? novoId(),
        organizacaoId: props.organizacaoId,
        cargo: props.cargo,
        ativo: props.ativo,
    });
    if (resultado.isFalha) {
        throw resultado.falha;
    }
    return resultado.resultado;
}

export function criarUsuario(props: { id?: string; email?: string; nome?: string } = {}): Usuario {
    const resultado = Usuario.criar({
        id: props.id ?? novoId(),
        email: props.email ?? "membro@empresa.com",
        senhaHash: "$2b$10$hashedpassword",
        nome: props.nome ?? "Maria Silva",
    });
    if (resultado.isFalha) {
        throw resultado.falha;
    }
    return resultado.resultado;
}

export function criarRepositorios() {
    const organizacaoRepo = {
        buscarPorId: vi.fn().mockResolvedValue(null),
        buscarPorSlug: vi.fn().mockResolvedValue(null),
        listarPorIds: vi.fn().mockResolvedValue([]),
        salvarComVinculo: vi.fn().mockResolvedValue(undefined),
    } as unknown as IRepositorioOrganizacao;

    const vinculoRepo = {
        buscarPorId: vi.fn().mockResolvedValue(null),
        buscarPorUsuarioEOrganizacao: vi.fn().mockResolvedValue(null),
        buscarAtivoPorUsuarioEOrganizacao: vi.fn().mockResolvedValue(null),
        listarPorUsuario: vi.fn().mockResolvedValue([]),
        listarAtivosPorUsuario: vi.fn().mockResolvedValue([]),
        listarPorOrganizacao: vi.fn().mockResolvedValue([]),
        listarAtivosPorOrganizacao: vi.fn().mockResolvedValue([]),
        // O adapter real devolve o vínculo persistido; aqui devolvemos o próprio objeto recebido
        salvar: vi.fn(async (vinculo: VinculoEmpregaticio) => vinculo),
    } as unknown as IRepositorioVinculoEmpregaticio;

    // Imita o adapter: lê os vínculos ativos "sob a trava" (listarAtivosPorOrganizacao), aplica a
    // alteração e só grava (salvar) quando ela não falha
    vinculoRepo.alterarComTravaDaOrganizacao = vi.fn(async (organizacaoId: Id, alterar) => {
        const vinculosAtivos = await vinculoRepo.listarAtivosPorOrganizacao(organizacaoId);
        const alteracao = alterar(vinculosAtivos);
        if (alteracao.isFalha) {
            return alteracao;
        }
        return Result.passar(await vinculoRepo.salvar(alteracao.resultado));
    });

    const usuarioRepo = {
        buscarPorId: vi.fn().mockResolvedValue(null),
        buscarPorEmail: vi.fn().mockResolvedValue(null),
        listarPorIds: vi.fn().mockResolvedValue([]),
        salvar: vi.fn(),
    } as unknown as IRepositorioUsuario;

    return { organizacaoRepo, vinculoRepo, usuarioRepo };
}

/**
 * Configura o vínculo ativo do solicitante na organização: `buscarAtivoPorUsuarioEOrganizacao`
 * devolve o vínculo cujo usuário bate com o id consultado, entre os vínculos informados.
 */
export function configurarVinculosAtivos(
    vinculoRepo: IRepositorioVinculoEmpregaticio,
    vinculos: VinculoEmpregaticio[],
): void {
    vi.mocked(vinculoRepo.buscarAtivoPorUsuarioEOrganizacao).mockImplementation(async (usuarioId, organizacaoId) =>
        vinculos.find(vinculo =>
            vinculo.estaAtivo
            && vinculo.usuarioId.equals(usuarioId)
            && vinculo.organizacaoId.equals(organizacaoId),
        ) ?? null,
    );
    vi.mocked(vinculoRepo.listarAtivosPorOrganizacao).mockImplementation(async (organizacaoId) =>
        vinculos.filter(vinculo => vinculo.estaAtivo && vinculo.organizacaoId.equals(organizacaoId)),
    );
}
