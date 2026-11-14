// O que se mexe na paisagem: estrelas que piscam, um halo que pulsa em volta da lua, uma
// estrela cadente de vez em quando e poeira de luar subindo das dunas. Tudo anda aos saltos
// (steps), como pixel art, e por cima da cena pontilhada.
//
// O app do Claude toca um fundo animado num player próprio, e só se a cena passar nas regras
// dele: nada de `shape-rendering`, `vector-effect` ou `color-scheme`, nenhum texto que pareça
// unidade de tela (por isso não há classe chamada `.vh`), só algumas funções de CSS e um
// custo por quadro baixo. O teste `tests/vida.test.ts` confere as regras de texto.

type Layout = {
  /** Largura da cena para a qual as coordenadas abaixo foram medidas. */
  width: number
  moon: { x: number; y: number; r: number }
  /** Estrelas no céu escuro, de 2 por 2 células: canto e grupo de cintilação. */
  stars: readonly (readonly [number, number, number])[]
  /** Onde a estrela cadente nasce e quanto anda. Fica abaixo da barra de título. */
  shooting: { x: number; y: number; dx: number; dy: number }
  /** Poeira de luar: pontos que sobem das dunas e somem. Canto e atraso, em segundos. */
  sparkles: readonly (readonly [number, number, number])[]
}

const DESKTOP: Layout = {
  width: 480,
  moon: { x: 313, y: 66, r: 31 },
  stars: [
    [14, 12, 0], [40, 28, 1], [66, 10, 2], [92, 22, 3], [118, 36, 0], [146, 14, 1], [172, 30, 2], [200, 11, 3],
    [226, 24, 0], [250, 42, 1], [392, 16, 2], [418, 32, 3], [444, 12, 0], [466, 26, 1], [26, 46, 2], [132, 52, 3],
    [380, 50, 0], [456, 52, 2],
  ],
  shooting: { x: 150, y: 26, dx: 96, dy: 32 },
  sparkles: [[170, 176, 0], [232, 168, 2.2], [300, 186, 4.1], [362, 172, 1.3], [424, 190, 3.2], [270, 196, 5.4]],
}

const MOBILE: Layout = {
  width: 240,
  moon: { x: 120, y: 97, r: 46 },
  stars: [[10, 12, 0], [32, 24, 1], [58, 9, 2], [196, 13, 3], [222, 26, 0], [180, 8, 1], [14, 38, 2], [228, 44, 3], [46, 42, 0]],
  shooting: { x: 14, y: 30, dx: 60, dy: 22 },
  sparkles: [[48, 300, 0], [104, 318, 2.4], [160, 292, 4.6], [212, 310, 1.2]],
}

function styles(layout: Layout): string {
  const { dx, dy } = layout.shooting
  const rules = [
    '.vs,.vr,.vc,.vp{transform-box:fill-box}',
    // As estrelas piscam, cada grupo no seu tempo.
    '.vs{animation:vtw 2.2s steps(1) infinite}.vs1{animation-delay:-.55s}.vs2{animation-delay:-1.1s}.vs3{animation-delay:-1.65s}',
    '@keyframes vtw{0%,50%{opacity:1}51%,100%{opacity:.15}}',
    // O halo da lua respira devagar: três anéis de pontos acendem e apagam aos poucos, de dentro
    // para fora, um a cada três segundos, sem passar da metade do brilho. Parado, fica um halo fraco.
    '.vr{opacity:.3;animation:vra 9s steps(5) infinite}.vr1{animation-delay:-6s}.vr2{animation-delay:-3s}',
    '@keyframes vra{0%{opacity:0}22%{opacity:.5}50%{opacity:0}100%{opacity:0}}',
    // A estrela cadente cruza o alto do céu a cada sete segundos.
    '.vc{opacity:0;animation:vsh 7s steps(12) infinite}',
    `@keyframes vsh{0%,80%{opacity:0;transform:translate(0,0)}81%{opacity:1;transform:translate(0,0)}97%{opacity:1;transform:translate(${dx}px,${dy}px)}100%{opacity:0;transform:translate(${dx}px,${dy}px)}}`,
    // A poeira de luar sobe das dunas e some, cada grão no seu tempo.
    '.vp{opacity:0;animation:vpo 6s steps(12) infinite}',
    '@keyframes vpo{0%{opacity:0;transform:translateY(0)}15%{opacity:1}70%{opacity:1}100%{opacity:0;transform:translateY(-24px)}}',
    layout.sparkles.map(([, , delay], i) => `.vp${i}{animation-delay:-${delay}s}`).join(''),
  ]

  // Quem pede menos movimento no sistema vê a mesma paisagem, parada.
  return `<style>${rules.join('')}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`
}

function sky(layout: Layout): string {
  const { moon, shooting } = layout
  // Um ponto a cada quatro células, em duas posições alternadas: o anel fica pontilhado.
  const dots = (id: string, x: number, y: number) =>
    `<pattern id="${id}" width="2" height="2" patternUnits="userSpaceOnUse"><rect x="${x}" y="${y}" width="1" height="1" fill="#e2ebff"/></pattern>`
  const ring = (group: number, radius: number) =>
    `<circle class="vr vr${group}" cx="${moon.x}" cy="${moon.y}" r="${radius}" fill="none" stroke="url(#vd${group % 2})" stroke-width="${Math.round(moon.r * 0.18)}"/>`
  const stars = layout.stars.map(([x, y, group]) => `<rect class="vs vs${group}" x="${x}" y="${y}" width="2" height="2"/>`).join('')
  const { x, y } = shooting
  const shootingStar =
    `<g class="vc"><rect x="${x}" y="${y}" width="4" height="1" opacity=".45"/><rect x="${x + 4}" y="${y + 1}" width="4" height="1" opacity=".7"/>` +
    `<rect x="${x + 8}" y="${y + 1}" width="3" height="2"/></g>`
  const sparkles = layout.sparkles.map(([sx, sy], i) => `<rect class="vp vp${i}" x="${sx}" y="${sy}" width="2" height="2"/>`).join('')

  return (
    `<defs>${dots('vd0', 0, 0)}${dots('vd1', 1, 1)}</defs>` +
    `${ring(0, Math.round(moon.r * 1.2))}${ring(1, Math.round(moon.r * 1.42))}${ring(2, Math.round(moon.r * 1.64))}` +
    `<g fill="#fafcff">${stars}${shootingStar}</g><g fill="#e2ebff">${sparkles}</g>`
  )
}

/** A cena com a camada animada por cima. A camada é medida numa largura fixa e escalada para a da cena. */
export function animateScene(scene: string, surface: 'desktop' | 'mobile'): string {
  const layout = surface === 'mobile' ? MOBILE : DESKTOP
  const end = scene.lastIndexOf('</svg>')

  if (end < 0) {
    return scene
  }

  const width = Number(/viewBox="0 0 (\d+(?:\.\d+)?) /.exec(scene)?.[1] ?? layout.width)
  const k = width / layout.width
  const layer = `${styles(layout)}${sky(layout)}`

  return `${scene.slice(0, end)}${k === 1 ? layer : `<g transform="scale(${+k.toFixed(4)})">${layer}</g>`}</svg>`
}
