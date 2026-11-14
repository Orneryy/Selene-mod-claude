// O que se mexe na paisagem: estrelas que piscam, um brilho em volta da lua, uma estrela
// cadente de vez em quando e um mascote na duna, que faz uma coisa em cada parte do dia.
// Tudo é desenhado por cima da cena pontilhada, em células do mesmo tamanho, e anda aos
// saltos (steps), como pixel art: assim a paisagem só é repintada algumas vezes por segundo.

/** A parte do dia, que escolhe o que o mascote faz. */
export type DayPart = 'madrugada' | 'manha' | 'tarde' | 'noite'

export function dayPart(hour: number): DayPart {
  if (hour < 5) {
    return 'madrugada'
  }

  if (hour < 12) {
    return 'manha'
  }

  return hour < 18 ? 'tarde' : 'noite'
}

type Layout = {
  moon: { x: number; y: number; r: number }
  /** Estrelas no céu escuro: célula e grupo de cintilação. */
  stars: readonly (readonly [number, number, number])[]
  /** Onde a estrela cadente nasce e quanto anda. */
  shooting: { x: number; y: number; dx: number; dy: number }
  /** A crista da duna da frente, medida na imagem: a altura a cada duas células. */
  ground: { from: number; heights: readonly number[] }
  /** A borda esquerda do mascote parado e quantos passos ele dá no passeio. */
  mascot: { x: number; steps: number }
}

const DESKTOP: Layout = {
  moon: { x: 313, y: 66, r: 31 },
  stars: [
    [14, 9, 0], [38, 24, 1], [61, 6, 2], [83, 17, 3], [107, 30, 0], [131, 10, 1], [156, 22, 2], [182, 7, 3],
    [205, 16, 0], [232, 5, 1], [398, 12, 2], [421, 26, 3], [447, 8, 0], [468, 20, 1], [26, 38, 2], [120, 41, 3],
  ],
  shooting: { x: 30, y: 6, dx: 64, dy: 22 },
  ground: {
    from: 100,
    heights: [
      149, 149, 150, 151, 151, 152, 153, 154, 154, 155, 156, 156, 157, 158, 158, 159, 160, 160, 161, 162, 163,
      163, 164, 165, 165, 166, 167, 167, 168, 168, 169, 169, 170, 171, 171, 172, 172, 172, 173, 173, 174,
    ],
  },
  mascot: { x: 100, steps: 28 },
}

const MOBILE: Layout = {
  moon: { x: 120, y: 97, r: 46 },
  stars: [[10, 8, 0], [32, 20, 1], [58, 5, 2], [196, 9, 3], [222, 22, 0], [180, 4, 1], [14, 34, 2], [228, 40, 3], [46, 38, 0]],
  shooting: { x: 8, y: 6, dx: 40, dy: 16 },
  ground: {
    from: 40,
    heights: [
      264, 265, 265, 266, 267, 267, 267, 268, 268, 268, 268, 268, 268, 268, 268, 268, 268, 268, 268, 268, 268, 268,
      268, 268, 268, 268, 268, 268, 267, 267, 266, 266, 265, 265, 264, 264, 264, 263, 263, 262, 262, 261, 259,
    ],
  },
  mascot: { x: 52, steps: 22 },
}

// O mascote: um bichinho próprio, em pixel art, na cor de terracota que lembra o Claude.
// Não é o mascote oficial: é um desenho original para a Selene. Cada letra é uma célula
// dele, que vale duas células da paisagem.
const MASCOT_ROWS = [
  '.....a.....',
  '.....s.....',
  '..ooooooo..',
  '.ooooooooo.',
  '.ooooooooo.',
  '.ooooooooo.',
  'ooooooooooo',
  '.ddddddddd.',
] as const
const MASCOT_W = 11
const MASCOT_H = MASCOT_ROWS.length + 1
const MASCOT_SCALE = 2
const MASCOT_FILL: Record<string, string> = { a: '#ffe2a8', s: '#b85c3e', o: '#d97757', d: '#b85c3e' }
const EYE = '#0a185c'

function groundAt(layout: Layout, x: number): number {
  const { from, heights } = layout.ground
  const index = Math.min(heights.length - 1, Math.max(0, Math.floor((x - from) / 2)))

  return heights[index] ?? 0
}

function mascot(layout: Layout, part: DayPart): string {
  const cells: string[] = []

  MASCOT_ROWS.forEach((row, y) => {
    let start = 0

    for (let x = 1; x <= row.length; x++) {
      if (x === row.length || row[x] !== row[start]) {
        const kind = row[start] ?? '.'
        const fill = MASCOT_FILL[kind]

        if (fill !== undefined) {
          const twinkle = kind === 'a' ? ' class="va"' : ''
          cells.push(`<rect${twinkle} x="${start}" y="${y}" width="${x - start}" height="1" fill="${fill}"/>`)
        }
        start = x
      }
    }
  })

  // Os pés ficam soltos do corpo, para marcarem o passo.
  const feetY = MASCOT_ROWS.length
  const feet =
    `<rect class="vf vf1" x="2" y="${feetY}" width="2" height="1" fill="#b85c3e"/>` +
    `<rect class="vf vf2" x="7" y="${feetY}" width="2" height="1" fill="#b85c3e"/>`

  // Dormindo, os olhos são dois traços. De noite, olham para o lado da lua.
  const eyes =
    part === 'madrugada'
      ? `<rect x="2" y="4" width="2" height="1" fill="${EYE}"/><rect x="7" y="4" width="2" height="1" fill="${EYE}"/>`
      : [3, 7]
          .map(x => x + (part === 'noite' ? 1 : 0))
          .map(x => `<rect class="ve" x="${x}" y="3" width="1" height="2" fill="${EYE}"/>`)
          .join('')

  // Dois "z" de 4 por 4 células, que sobem de cima da cabeça.
  const zs =
    part === 'madrugada'
      ? [0, 1].map(i => `<path class="vz vz${i}" fill="#e2ebff" d="M9 -4h4v1h-1v1h-1v-1h-2zM10 -2h1v1h2v1h-4v-1h1z"/>`).join('')
      : ''

  const centre = layout.mascot.x + (MASCOT_W * MASCOT_SCALE) / 2
  const top = groundAt(layout, centre) - MASCOT_H * MASCOT_SCALE

  return (
    `<g transform="translate(${layout.mascot.x} ${top}) scale(${MASCOT_SCALE})">` +
    `${zs}<g class="vm">${cells.join('')}${feet}${eyes}</g></g>`
  )
}

// O passeio da tarde: o mascote anda sobre a crista da duna, um passo por vez, e volta.
function walkKeyframes(layout: Layout): string {
  const centre = layout.mascot.x + (MASCOT_W * MASCOT_SCALE) / 2
  const base = groundAt(layout, centre)
  const out: number[] = []

  for (let step = 0; step <= layout.mascot.steps; step++) {
    out.push(step)
  }
  const path = [...out, ...out.slice(0, -1).reverse()]

  return path
    .map((step, i) => {
      const dy = (groundAt(layout, centre + step * MASCOT_SCALE) - base) / MASCOT_SCALE

      return `${((i / path.length) * 100).toFixed(1)}%{transform:translate(${step}px,${dy}px)}`
    })
    .join('')
}

function styles(layout: Layout, part: DayPart): string {
  const { dx, dy } = layout.shooting
  const rules = [
    '.vm,.ve,.va,.vf,.vz,.vs,.vh,.vc{transform-box:fill-box}',
    // As estrelas e a antena do mascote piscam, cada grupo no seu tempo.
    '.vs,.va{animation:vtw 2.8s steps(1) infinite}.vs1{animation-delay:-.7s}.vs2{animation-delay:-1.4s}.vs3{animation-delay:-2.1s}',
    '@keyframes vtw{0%,55%{opacity:1}56%,100%{opacity:.2}}',
    // O brilho em volta da lua alterna entre dois anéis de pontos.
    '.vh{animation:vha 5s steps(1) infinite}.vh1{animation-delay:-2.5s}',
    '@keyframes vha{0%,49%{opacity:1}50%,100%{opacity:0}}',
    // A estrela cadente passa uma vez a cada treze segundos.
    '.vc{opacity:0;animation:vsh 13s steps(9) infinite}',
    `@keyframes vsh{0%,88%{opacity:0;transform:translate(0,0)}89%{opacity:1;transform:translate(0,0)}98%{opacity:1;transform:translate(${dx}px,${dy}px)}100%{opacity:0;transform:translate(${dx}px,${dy}px)}}`,
  ]

  if (part !== 'madrugada') {
    rules.push(
      '.ve{transform-origin:50% 50%;animation:vbl 4.6s steps(1) infinite}',
      '@keyframes vbl{0%,93%{transform:scaleY(1)}94%,100%{transform:scaleY(.01)}}',
    )
  }

  if (part === 'madrugada') {
    rules.push(
      '.vm{transform-origin:50% 100%;animation:vbr 3.4s steps(1) infinite}',
      '@keyframes vbr{0%,49%{transform:scaleY(1)}50%,100%{transform:scaleY(.9)}}',
      '.vz{opacity:0;animation:vzz 3.4s steps(7) infinite}.vz1{animation-delay:-1.7s}',
      '@keyframes vzz{0%{opacity:0;transform:translate(0,0)}15%{opacity:1}75%{opacity:1}100%{opacity:0;transform:translate(5px,-9px)}}',
    )
  }

  if (part === 'manha') {
    rules.push(
      '.vm{animation:vhop 1.6s steps(1) infinite}',
      '@keyframes vhop{0%,50%,100%{transform:translateY(0)}10%,40%{transform:translateY(-2px)}20%,30%{transform:translateY(-4px)}}',
    )
  }

  if (part === 'tarde') {
    rules.push(
      `.vm{animation:vwk ${(layout.mascot.steps * 0.7).toFixed(1)}s steps(1) infinite}`,
      `@keyframes vwk{${walkKeyframes(layout)}}`,
      '.vf{animation:vft .7s steps(1) infinite}.vf2{animation-delay:-.35s}',
      '@keyframes vft{0%,49%{transform:translateY(0)}50%,100%{transform:translateY(-1px)}}',
    )
  }

  // Quem pede menos movimento no sistema vê a mesma paisagem, parada. A regra é escrita
  // assim, e não ao contrário, para a animação valer onde a consulta não é entendida.
  return `<style>${rules.join('')}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`
}

function sky(layout: Layout): string {
  const { moon, shooting } = layout
  const dots = (id: string, x: number, y: number) =>
    `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"><rect x="${x}" y="${y}" width="1" height="1" fill="#e2ebff"/></pattern>`
  const ring = (group: number, id: string, radius: number) =>
    `<circle class="vh vh${group}" cx="${moon.x}" cy="${moon.y}" r="${radius}" fill="none" stroke="url(#${id})" stroke-width="${Math.round(moon.r * 0.3)}"/>`
  const stars = layout.stars.map(([x, y, group]) => `<rect class="vs vs${group}" x="${x}" y="${y}" width="1" height="1"/>`).join('')
  const { x, y } = shooting
  const shootingStar =
    `<g class="vc"><rect x="${x}" y="${y}" width="3" height="1"/><rect x="${x + 3}" y="${y + 1}" width="3" height="1"/>` +
    `<rect x="${x + 6}" y="${y + 2}" width="2" height="1"/></g>`

  return (
    `<defs>${dots('vp0', 1, 2)}${dots('vp1', 3, 0)}</defs>` +
    `${ring(0, 'vp0', Math.round(moon.r * 1.3))}${ring(1, 'vp1', Math.round(moon.r * 1.55))}` +
    `<g fill="#fafcff">${stars}${shootingStar}</g>`
  )
}

/** A cena com a camada animada por cima, para a superfície e a parte do dia dadas. */
export function animateScene(scene: string, surface: 'desktop' | 'mobile', part: DayPart): string {
  const layout = surface === 'mobile' ? MOBILE : DESKTOP
  const end = scene.lastIndexOf('</svg>')

  if (end < 0) {
    return scene
  }

  return `${scene.slice(0, end)}${styles(layout, part)}${sky(layout)}${mascot(layout, part)}</svg>`
}
