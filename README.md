# selene-lua

Um tema para o Claude Code nos apps de desktop e celular: os sete azuis do mundo da lua da Selene, com a lua cheia pontilhada sobre as dunas atrás da conversa.

![A lua cheia pontilhada sobre dunas azuis](docs/previa.png)

## O que ele muda

- **Cores:** a interface inteira passa a usar os sete azuis da imagem, nos modos claro e escuro. O destaque é o azul elétrico `#2558e8`.
- **Fundo:** a paisagem da lua aparece atrás da conversa, com os painéis translúcidos por cima. No celular, o fundo é um recorte em pé, com a lua maior.

O tema só aparece nos apps de desktop e celular. O terminal e os editores não desenham temas.

As sete cores, da mais escura à mais clara:

`#0a185c` `#1634aa` `#2558e8` `#5c86f6` `#a0bcff` `#e2ebff` `#fafcff`

## Instalar

No prompt de uma sessão do Claude Code no terminal:

```
/plugin install selene-lua --marketplace Orneryy/Selene-mod-claude
```

Ou direto do shell:

```
claude plugin install selene-lua --marketplace Orneryy/Selene-mod-claude
```

O Claude Code pergunta se pode adicionar o marketplace (responda `y`) e depois em qual escopo instalar (Enter aceita o escopo de usuário). Instalado no escopo de usuário, o tema carrega em toda sessão nova, inclusive nas do app de desktop.

No app de desktop, onde `/plugin` não roda: clique em **+** ao lado da caixa de mensagem, depois em **Plugins**, **Add marketplace** com `Orneryy/Selene-mod-claude`, e então **Add plugin**.

## Ajustar

- As cores ficam em `hooks/register.tsx`.
- O quanto os painéis cobrem a paisagem é o `opacity` de `backdrop.glass`, no mesmo arquivo: um valor menor mostra mais a imagem, um maior deixa o texto mais firme.
- `hooks/scene.ts` é gerado e não deve ser editado à mão. A paisagem vai como vetor puro, sem imagem embutida: o pontilhado é refeito por 96 regiões, cada uma preenchida por um padrão que pinta uma das 16 células de um ladrilho 4 × 4 em um dos tons.
