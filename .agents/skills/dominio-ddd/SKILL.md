---
name: dominio-ddd
description: Padrões arquiteturais e princípios de Domain Driven Design para a camada de domínio (entidades, value objects, erros de domínio) deste projeto — construtor privado como simples atribuição, validação centralizada na fábrica estática `criar` via Result, Tell-Don't-Ask no lugar de getters anêmicos, e a convenção *.entidade.ts para entidades. Aplicar sempre que for criar, revisar ou refatorar código dentro de domain/.
---

# Padrões de Domínio (DDD)

Contexto: o projeto segue Domain Driven Design. Estas regras valem para tudo dentro de `domain/` — entidades, value objects e erros de domínio.

## 1. Construtor privado = simples atribuição

O `constructor` é sempre `private` e só atribui valores aos campos. Ele nunca valida, nunca lança exceção, nunca decide nada. Pode aceitar um default trivial (`??`) ou derivar um campo de forma determinística a partir do que já foi recebido, mas nunca pode rejeitar um valor inválido.

Correto (`Id`):
```ts
private constructor(valor?: string) {
    this._valor = valor ?? uuidv4();
}
```

Correto (`Usuario`, com props):
```ts
private constructor(props: UsuarioProps) {
    this._id = props.id ?? Id.criar().resultado;
    this._email = props.email;
    this._senhaHash = props.senhaHash;
    this._nome = props.nome;
}
```

Errado — validação dentro do constructor:
```ts
private constructor(valor: string) {
    if (!regexEmail.test(valor)) throw new Error("email inválido");
    this._valor = valor;
}
```

## 2. Toda validação vive na fábrica estática `criar`

`criar` é o único ponto de entrada público para instanciar o objeto. Ele:

- roda a validação (extraída, quando fizer sentido, para um `private static validar`);
- retorna `Result<T>` — nunca lança exceção para um erro esperado de validação;
- em caso de falha, retorna `Result.falhar(new AlgumErroDeDominio(...))`, onde o erro estende `ErroDeDominio`;
- em caso de sucesso, retorna `Result.passar(new Entidade(...))`.

Exemplo (`Email`):
```ts
static criar(valor: string): Result<Email> {
    const emailResult = Email.validarEmail(valor);
    if (emailResult.isFalha) {
        return Result.falhar(emailResult.falha);
    }
    return Result.passar(new Email(valor));
}

private static validarEmail(email: string): Result<true> {
    const emailValido = regexEmail.test(email);
    if (!emailValido) return Result.falhar(new EmailInvalidoError(email));
    return Result.passar(true);
}
```

Isso vale mesmo quando o objeto ainda não tem validação própria (ex.: uma entidade que só agrega value objects já validados). `criar` continua sendo o único ponto de entrada e continua retornando `Result`, ainda que hoje sempre tenha sucesso — isso deixa a porta aberta para regras de invariante futuras sem quebrar a assinatura pública.

## 3. Tell, Don't Ask — evitar getters anêmicos

Não exponha estado só para que **outro lugar do código** leia esse estado e decida o que fazer com ele. Isso é o padrão de domínio anêmico: a entidade vira um saco de getters/setters e a regra de negócio migra para services e use cases.

Regra prática: se você está prestes a escrever um use case/service que faz `entidade.algumGetter`, testa uma condição, e em seguida chama um setter — essa decisão pertence a um **método de comportamento** na própria entidade, não a quem a chama.

Errado — lógica de negócio fora da entidade:
```ts
// dentro de um use case
if (vinculo.cargo === TipoCargo.Estagiario && condicaoQualquer) {
    vinculo.setCargo(TipoCargo.Junior);
}
if (algumaRegra) {
    vinculo.setAtivo(false);
}
```

Correto — comportamento encapsulado (`VinculoEmpregaticio`):
```ts
public alterarCargo(novoCargo: TipoCargo): void {
    this._cargo = novoCargo;
}

public ativar(): void {
    this._ativo = true;
}

public desativar(): void {
    this._ativo = false;
}
```
```ts
// no use case, apenas "manda":
vinculo.alterarCargo(TipoCargo.Junior);
vinculo.desativar();
```

Getters continuam existindo e são necessários — para leitura (exibição, mapeamento de persistência, comparação). O que se evita é reduzir a entidade a getters+setters e mover toda a regra para fora dela. Se um getter só existe para alguém decidir algo e depois chamar um setter correspondente, esse é o cheiro a corrigir: vira um método nomeado pela intenção de negócio (`alterarCargo`, `ativar`, `desativar`), nunca `setCargo`/`setAtivo`.

## 4. Convenção de nome de arquivo para entidades

Toda entidade (objeto com identidade própria, distinto de um value object) fica em um arquivo terminado em `*.entidade.ts`.

Exemplos existentes: `usuario.entidade.ts`, `vinculo-empregaticio.entidade.ts`.

## Checklist antes de terminar uma entidade / value object

- [ ] `constructor` é `private` e só atribui — nenhuma validação, nenhum `throw`.
- [ ] Existe um `static criar(...)` público que retorna `Result<T>`.
- [ ] Toda validação está em `criar` (ou em `private static` auxiliares chamados por ele), nunca espalhada em getters ou métodos públicos.
- [ ] Falhas de validação retornam `Result.falhar(new XxxError(...))` com erro estendendo `ErroDeDominio` — nunca lançam exceção.
- [ ] Nenhum getter existe só para permitir que um caller decida uma regra de negócio e chame um setter em seguida; isso virou um método de comportamento nomeado pela intenção (ex.: `ativar`, `alterarCargo`).
- [ ] Se é uma entidade, o arquivo termina em `.entidade.ts`.
