import { expect, test } from 'claude-code/testing'

import { SCENE_DESKTOP, SCENE_MOBILE } from '../hooks/scene'

const BACKDROP = {
  plugin: 'selene-lua',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: {
    scene: 'mundo-da-lua',
    plugin: 'selene-lua',
    glass: { blur: 0, opacity: 0.62 },
  },
} as const

test('a cena do mundo da lua é desenhada no desktop e no celular', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })
    const svg = await ui.find({ type: 'Svg' })

    expect(svg === undefined).toBe(false)
    await ui.unmount()
  }
})

test('o fundo é a paisagem parada: sem animação e sem imagem embutida', () => {
  for (const svg of [SCENE_DESKTOP, SCENE_MOBILE]) {
    expect(svg.length < 131_072).toBe(true)
    expect(svg.includes('<image')).toBe(false)
    expect(svg.includes('@keyframes')).toBe(false)
    expect(svg.includes('<animate')).toBe(false)
  }
})
