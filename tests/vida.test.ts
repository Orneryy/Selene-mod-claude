import { expect, test } from 'claude-code/testing'

import { SCENE_DESKTOP, SCENE_MOBILE } from '../hooks/scene'
import { animateScene } from '../hooks/vida'

// As regras de texto que o app aplica antes de tocar um fundo animado, copiadas dele
// (versão do site, novembro de 2026). Uma cena que falha em qualquer uma fica congelada.
const ALLOWED_FUNCTIONS = new Set(
  'color.color-mix.hsl.hsla.hwb.lab.lch.oklab.oklch.rgb.rgba.abs.acos.asin.atan.atan2.calc.clamp.cos.exp.hypot.log.max.min.mod.pow.rem.round.sign.sin.sqrt.tan.var.matrix.matrix3d.perspective.rotate.rotate3d.rotatex.rotatey.rotatez.scale.scale3d.scalex.scaley.scalez.skew.skewx.skewy.translate.translate3d.translatex.translatey.translatez.cubic-bezier.linear.steps.blur.drop-shadow.grayscale.hue-rotate.invert.opacity.saturate.sepia.is.not.nth-child.nth-last-child.nth-last-of-type.nth-of-type.where'.split('.'),
)
const ALLOWED_AT_RULES = new Set(['keyframes', 'layer', 'media', 'supports'])
const VIEWPORT_UNIT = /(?:\d|\.)(?:[dsl]?v(?:w|h|i|b|min|max)|cq(?:w|h|i|b|min|max))(?![a-z0-9_-])/i
const FORBIDDEN = /shape-rendering|vector-effect|color-scheme/i

function passesTextRules(text: string): boolean {
  if (text.includes('\\') || VIEWPORT_UNIT.test(text) || FORBIDDEN.test(text)) {
    return false
  }

  const media = [...text.matchAll(/@media([^{]*)(\{|$)/gi)].every(
    ([, query = '', brace]) =>
      brace === '{' &&
      /^(?:\s|,|all|and|not|only|or|screen)*$/i.test(query.replaceAll(/\(\s*prefers-reduced-motion(?:\s*:\s*(?:reduce|no-preference))?\s*\)/gi, '')),
  )
  const flat = text.replaceAll(/[\s\p{Cc}]/gu, '').toLowerCase()
  const withoutRefs = text.replaceAll(/url\(#[A-Za-z_][\w.:-]*\)/gi, '').replaceAll(/[\s\p{Cc}]/gu, '').toLowerCase()
  const functions = [...text.matchAll(/([^\s()[\]{}<>;:,'"`=+*/!@#$%^&|~?]{0,64})\(/g)].every(([, name = '']) => {
    const lower = name.toLowerCase()

    return lower === '' || lower === 'url' || ALLOWED_FUNCTIONS.has(lower)
  })
  const atRules = [...text.matchAll(/@([^\s{};("'/]*)/g)].every(([, name = '']) => ALLOWED_AT_RULES.has(name.toLowerCase()))

  return media && !flat.includes('data:') && !withoutRefs.includes('url(') && functions && atRules
}

function brokenRules(svg: string): string[] {
  const broken: string[] = []

  for (const [, css = ''] of svg.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
    if (!passesTextRules(css)) {
      broken.push(`estilo: ${css.slice(0, 80)}`)
    }
  }

  for (const [, name = '', value = ''] of svg.matchAll(/\s([a-zA-Z:-]+)="([^"]*)"/g)) {
    if (FORBIDDEN.test(name) || /^on/i.test(name) || (name !== 'xmlns' && !passesTextRules(value))) {
      broken.push(`atributo ${name}="${value.slice(0, 40)}"`)
    }
  }

  return broken
}

test('a cena animada passa nas regras do app, no computador e no celular', () => {
  expect(brokenRules(animateScene(SCENE_DESKTOP, 'desktop'))).toEqual([])
  expect(brokenRules(animateScene(SCENE_MOBILE, 'mobile'))).toEqual([])
})

test('as regras pegam o que já congelou o fundo antes', () => {
  expect(brokenRules('<svg shape-rendering="crispEdges"></svg>').length).toBe(1)
  expect(brokenRules('<svg><style>.vh{opacity:0}</style></svg>').length).toBe(1)
})

test('a cena animada cabe no limite de um Svg e continua sem imagem embutida', () => {
  for (const svg of [animateScene(SCENE_DESKTOP, 'desktop'), animateScene(SCENE_MOBILE, 'mobile')]) {
    expect(svg.length < 131_072).toBe(true)
    expect(svg.includes('<image')).toBe(false)
    expect(svg.endsWith('</svg>')).toBe(true)
    expect(svg.includes('prefers-reduced-motion')).toBe(true)
  }
})

test('o céu se mexe: estrelas, halo, estrela cadente e poeira de luar, sem mascote', () => {
  const svg = animateScene(SCENE_DESKTOP, 'desktop')

  for (const name of ['vtw', 'vra', 'vsh', 'vpo']) {
    expect(svg.includes(`@keyframes ${name}`)).toBe(true)
  }
  expect(svg.includes('#d97757')).toBe(false)
})
