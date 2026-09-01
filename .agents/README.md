# .agents

Repositório de instruções ("skills") reutilizáveis por qualquer agente de IA (Claude Code, Cursor, Copilot, Codex etc.), independente da ferramenta usada.

## Estrutura

```
.agents/
  skills/
    <nome-da-skill>/
      SKILL.md      # conteúdo canônico, markdown puro, sem nada específico de uma ferramenta
```

Cada `SKILL.md` aqui dentro é a **fonte única de verdade**. Ferramentas específicas podem ter um espelho fino no seu próprio diretório de configuração — por exemplo, o Claude Code lê `.claude/skills/<nome>/SKILL.md` para poder invocar a skill via `/<nome>`. O espelho não duplica o conteúdo: ele só aponta para o arquivo canônico aqui, para nunca haver duas versões divergentes da mesma regra.

## Convenção de cada SKILL.md

```yaml
---
name: nome-em-kebab-case
description: Frase objetiva dizendo o que a skill rege e quando usá-la.
---
```

Seguido do corpo em markdown: regras, exemplos "antes/depois" tirados do próprio projeto sempre que possível, e um checklist de autorrevisão no final.

## Como adicionar uma nova skill

1. Crie `.agents/skills/<nome>/SKILL.md` com o conteúdo canônico.
2. Se quiser poder invocá-la no Claude Code via `/<nome>`, crie o espelho em `.claude/skills/<nome>/SKILL.md`: mesmo frontmatter (`name`/`description`) e, no corpo, uma instrução para ler o arquivo canônico em `.agents/` e aplicá-lo.
3. Liste a skill na tabela abaixo.

## Skills existentes

| Skill | Descrição |
|---|---|
| [dominio-ddd](skills/dominio-ddd/SKILL.md) | Padrões e princípios de DDD para a camada de domínio: construtor privado, fábrica `criar`, Tell-Don't-Ask, convenção `*.entidade.ts`. |
