import { describe, expect, it } from 'vitest'
import {
  markedRenderOptions,
  turndownOptions,
  strikethroughReplacement
} from '../../src/utils/markdownHtml'

describe('markdownHtml utils', () => {
  it('should expose expected marked options', () => {
    expect(markedRenderOptions.gfm).toBe(true)
    expect(markedRenderOptions.breaks).toBe(true)
  })

  it('should expose expected turndown options', () => {
    expect(turndownOptions.codeBlockStyle).toBe('fenced')
    expect(turndownOptions.headingStyle).toBe('atx')
  })

  it('should render strikethrough replacement', () => {
    expect(strikethroughReplacement('hello')).toBe('~~hello~~')
  })
})
