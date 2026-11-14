import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'selene-lua',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: {
    scene: 'mundo-da-lua-vivo',
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
