# selene-lua

Um tema para o Claude Code nos apps de desktop e celular: os sete azuis do mundo da lua da Selene, com a lua cheia pontilhada sobre as dunas atrás da conversa, estrelas que piscam e um halo que pulsa em volta da lua.

![A lua cheia pontilhada sobre dunas azuis, com estrelas e um halo de pontos em volta da lua](docs/previa.png)

## O que ele muda

- **Cores:** a interface inteira passa a usar os sete azuis da imagem, nos modos claro e escuro. O destaque é o azul elétrico `#2558e8`.
- **Fundo:** a paisagem da lua aparece atrás da conversa, com os painéis translúcidos por cima. No celular, o fundo é um recorte em pé, com a lua maior.
- **Movimento:** as estrelas piscam, um halo de pontos pulsa em volta da lua, uma estrela cadente cruza o céu a cada sete segundos e pontos de luar sobem das dunas.

As sete cores, da mais escura à mais clara:

`#0a185c` `#1634aa` `#2558e8` `#5c86f6` `#a0bcff` `#e2ebff` `#fafcff`

## O que esperar

- O tema só aparece nos apps de desktop e celular. O terminal e os editores não desenham temas.
- O tema é de cada sessão: um chat ganha a lua depois que a primeira mensagem inicia a sessão dele.
- Quem decide se o fundo se mexe é o app. Ele congela a paisagem quando o sistema pede menos movimento, quando a janela desenha sem aceleração de vídeo, ou quando o computador está tão ocupado que desenhar o fundo fica caro. Nesse último caso, o fundo fica parado até o app recarregar.
- É preciso uma versão do Claude Code com suporte a temas. Numa versão anterior, o mod carrega e não pinta nada.

## Instalar

No app de desktop: clique em **+** ao lado da caixa de mensagem, depois em **Plugins**, **Add marketplace** com `Orneryy/Selene-mod-claude`, e então **Add plugin**.

No prompt de uma sessão do Claude Code no terminal:

```
/plugin install selene-lua --marketplace Orneryy/Selene-mod-claude
```

Ou direto do shell:

```
claude plugin install selene-lua --marketplace Orneryy/Selene-mod-claude
```

O Claude Code pergunta se pode adicionar o marketplace (responda `y`) e depois em qual escopo instalar (Enter aceita o escopo de usuário). Instalado no escopo de usuário, o tema carrega em toda sessão nova, inclusive nas do app de desktop.

## Atualizar

Quem já instalou pega a versão nova com:

```
claude plugin marketplace update selene-mod-claude
claude plugin update selene-lua@selene-mod-claude
```

A atualização vale para as sessões iniciadas depois dela.

## Ajustar

- As cores ficam em `hooks/register.tsx`.
- O quanto os painéis cobrem a paisagem é o `opacity` de `backdrop.glass`, no mesmo arquivo: um valor menor mostra mais a imagem, um maior deixa o texto mais firme.
- O que se mexe fica em `hooks/vida.ts`: as estrelas, o halo, a estrela cadente e a poeira de luar.
- `hooks/scene.ts` é gerado e não deve ser editado à mão. A paisagem vai como vetor puro, sem imagem embutida: o pontilhado é refeito por 96 regiões, cada uma preenchida por um padrão que pinta uma das 16 células de um ladrilho 4 × 4 em um dos tons.

### Para a animação tocar

O app só toca um fundo animado se a cena passar nas regras dele, e `tests/vida.test.ts` confere as de texto. Ao mexer na cena:

- não use `shape-rendering`, `vector-effect` nem `color-scheme`, nem como atributo nem no CSS;
- não escreva nada que pareça uma unidade de tela, como uma classe chamada `.vh`;
- não use `data:`, nem `url()` fora de referências `#id`;
- mantenha a cena leve: o app para a animação se desenhar cada quadro ficar caro.
