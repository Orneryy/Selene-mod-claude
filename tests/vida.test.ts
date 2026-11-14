import { expect, test } from 'claude-code/testing'

import { SCENE_DESKTOP, SCENE_MOBILE } from '../hooks/scene'
import { animateScene, dayPart } from '../hooks/vida'

test('as horas caem na parte certa do dia', () => {
  expect(dayPart(0)).toBe('madrugada')
  expect(dayPart(4)).toBe('madrugada')
  expect(dayPart(5)).toBe('manha')
  expect(dayPart(12)).toBe('tarde')
  expect(dayPart(18)).toBe('noite')
  expect(dayPart(23)).toBe('noite')
})

test('cada parte do dia tem a sua animação do mascote', () => {
  expect(animateScene(SCENE_DESKTOP, 'desktop', 'madrugada').includes('@keyframes vzz')).toBe(true)
  expect(animateScene(SCENE_DESKTOP, 'desktop', 'manha').includes('@keyframes vhop')).toBe(true)
  expect(animateScene(SCENE_DESKTOP, 'desktop', 'tarde').includes('@keyframes vwk')).toBe(true)
  expect(animateScene(SCENE_DESKTOP, 'desktop', 'noite').includes('@keyframes vwk')).toBe(false)
})

test('a cena animada cabe no limite de um Svg e continua sem imagem embutida', () => {
  for (const part of ['madrugada', 'manha', 'tarde', 'noite'] as const) {
    for (const [scene, surface] of [[SCENE_DESKTOP, 'desktop'], [SCENE_MOBILE, 'mobile']] as const) {
      const svg = animateScene(scene, surface, part)

      expect(svg.length < 131_072).toBe(true)
      expect(svg.includes('<image')).toBe(false)
      expect(svg.endsWith('</svg>')).toBe(true)
      expect(svg.includes('prefers-reduced-motion')).toBe(true)
    }
  }
})
