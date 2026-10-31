import { describe, it, expect } from 'vitest'
import { formatTime, todayKey } from '../utils/format'
import { remedialPath } from '../learning/engine'

describe('format', () => {
  it('formats time', () => {
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(0)).toBe('0:00')
  })
  it('todayKey length', () => {
    expect(todayKey()).toHaveLength(10)
  })
})

describe('learning engine', () => {
  it('remedial path', () => {
    const p = remedialPath('x')
    expect(p[0]).toBe('Foundation')
    expect(p[p.length - 1]).toBe('Reassessment')
  })
})
