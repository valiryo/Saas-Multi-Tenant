export class FormatadorDeTexto {
  /**
   * Remove todos os caracteres numéricos (0-9) de uma string.
   */
  static removerNumeros(text: string): string {
    if (!text) return '';
    return text.replace(/[0-9]/g, '');
  }

  /**
   * Remove todos os espaços em branco de uma string (inclusive espaços internos).
   */
  static removerTodosEspacos(text: string): string {
    if (!text) return '';
    return text.replace(/\s+/g, '');
  }

  /**
   * Remove espaços extras no início, no fim e reduz múltiplos espaços internos para apenas um.
   * Exemplo: "  TypeScript   é   bom  " -> "TypeScript é bom"
   */
  static trimEspacosExtras(text: string): string {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Remove acentos e caracteres especiais, substituindo-os por seus equivalentes base.
   * Exemplo: "Ação e Épico" -> "Acao e Epico"
   */
  static removerAcentos(text: string): string {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Remove todos os caracteres especiais (símbolos, pontuação), mantendo apenas letras, números e espaços.
   */
  static removerCaracteresEspeciais(text: string): string {
    if (!text) return '';
    // Mantém letras (incluindo acentuadas via regex Unicode), números e espaços
    return text.replace(/[^\p{L}\p{N}\s]/gu, '');
  }

  /**
   * Converte o texto para o formato slug (ideal para URLs).
   * Exemplo: "TypeScript: O Guia Definitivo!" -> "typescript-o-guia-definitivo"
   */
  static slugify(text: string): string {
    if (!text) return '';
    return this.removerAcentos(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove o que não for alfanumérico, espaço ou hífen
      .trim()
      .replace(/\s+/g, '-')         // Substitui espaços por hífen
      .replace(/-+/g, '-')          // Remove hífens duplicados
      .replace(/^-|-$/g, '');       // Remove hífens das pontas
  }

  /**
   * Limita o texto a um tamanho máximo e adiciona reticências (...) se for truncado.
   */
  static truncar(text: string, maxLength: number, append: string = '...'): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + append;
  }

  /**
   * Transforma a primeira letra de cada palavra em maiúscula.
   * Exemplo: "joão silva dos santos" -> "João Silva Dos Santos"
   */
  static capitalizarPalavras(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
  }
}