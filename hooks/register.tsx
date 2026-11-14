import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE_DESKTOP, SCENE_MOBILE } from './scene'
import { animateScene } from './vida'

// O mundo da lua da Selene. As sete cores da imagem, da mais escura à mais clara:
//   #0a185c  #1634aa  #2558e8  #5c86f6  #a0bcff  #e2ebff  #fafcff
// De dia, o luar: a página e os cartões usam os dois tons mais claros, e o texto,
// os dois mais escuros. De noite, o céu: superfícies abaixo do azul mais escuro
// da imagem, e o texto nos tons claros dela.
const { theme, problems } = makeColors({
  label: 'Selene · Mundo da Lua',
  // O azul elétrico da imagem é o destaque. As demais são as cores de estado da marca.
  roles: { accent: '#2558e8', danger: '#dc2627', success: '#007e46', warning: '#a76100', pro: '#6f49ca' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#e2ebff',
        'surface-1': '#eef3ff',
        'surface-2': '#fafcff',
        'text-primary': '#0a185c',
        'text-secondary': '#1634aa',
        'text-muted': '#4058b4',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#071033',
        'surface-1': '#091540',
        'surface-2': '#0b1a4d',
        'surface-3': '#0d1d57',
        'text-primary': '#e2ebff',
        'text-secondary': '#a0bcff',
        'text-muted': '#8aa3ea',
      },
    },
  },
})

// O nome muda quando a cena muda de natureza: um nome novo obriga o app a pedir o desenho de novo.
const SCENE_NAME = 'mundo-da-lua-vivo'

const LOOK: ThemeSetArgs = {
  colors: theme,
  // A paisagem é uma cena, e não uma imagem parada, para os painéis ficarem
  // translúcidos sobre ela. Sem `tint`, o véu usa a cor de painel de cada modo.
  // `opacity` é o quanto o painel cobre a paisagem: menor mostra mais a imagem,
  // maior deixa o texto mais firme.
  backdrop: { scene: SCENE_NAME, glass: { blur: 0, opacity: 0.62 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    // Uma versão do Claude Code anterior aos temas não tem `$.theme`, e a chamada falha:
    // lá o mod só não pinta nada.
    try {
      const set = await $.theme.set(LOOK)

      if (!set.isDrawn) {
        $.ui.status(set.reason)
      }
      // Depois de uma recarga do mod, o tema é o mesmo: o pedido explícito garante o redesenho.
      $.ui.invalidate('ui.render')
    } catch {
      $.ui.status(undefined)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.scene !== SCENE_NAME || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    // No desktop, o quadro largo, com a lua no alto à direita. No celular, um
    // recorte em pé com a lua maior e centrada. Os dois prendem o topo, para a
    // lua nunca ser cortada.
    const scene = e.surface === 'mobile' ? SCENE_MOBILE : SCENE_DESKTOP

    return (
      <Svg
        source={animateScene(scene, e.surface)}
        alt="Lua cheia pontilhada sobre dunas azuis, com estrelas piscando e um halo que pulsa"
        isInteractive
      />
    )
  })
}
