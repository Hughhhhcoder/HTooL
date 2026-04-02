import { describe, expect, it } from 'vitest'
import { parseMatrixInput, parseNumericList } from '../../src/utils/mathTool'

describe('math tool utils', () => {
  it('should parse numeric list', () => {
    expect(parseNumericList('1, 2, 3')).toEqual([1, 2, 3])
  })

  it('should throw on empty numeric list', () => {
    expect(() => parseNumericList('a,b,c')).toThrow()
  })

  it('should parse matrix input', () => {
    expect(parseMatrixInput('1,2;3,4')).toEqual([
      [1, 2],
      [3, 4]
    ])
  })

  it('should throw on invalid matrix input', () => {
    expect(() => parseMatrixInput('1,a;2,3')).toThrow()
  })
})
