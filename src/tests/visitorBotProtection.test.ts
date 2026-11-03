import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isIneligibleDocumentContext,
  waitForHumanActivity,
} from '../services/visitorBotProtection'

/** Mark an event as produced by the browser rather than dispatched by script. */
function trustedEvent(name: string): Event {
  const event = new Event(name)
  Object.defineProperty(event, 'isTrusted', { value: true })
  return event
}

function untrustedEvent(name: string): Event {
  return new Event(name)
}

interface FakeDocument extends EventTarget {
  visibilityState: DocumentVisibilityState
}

let fakeWindow: EventTarget
let fakeDocument: FakeDocument

const openGate = (options: { now?: () => number; scrollGraceMs?: number } = {}) =>
  waitForHumanActivity({ scrollGraceMs: 0, ...options })

function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/** Track whether a promise has settled without awaiting it. */
function observe<T>(promise: Promise<T>) {
  const state: { settled: boolean; value?: T } = { settled: false }
  void promise.then((value) => {
    state.settled = true
    state.value = value
  })
  return state
}

beforeEach(() => {
  fakeWindow = new EventTarget()
  fakeDocument = Object.assign(new EventTarget(), { visibilityState: 'visible' as DocumentVisibilityState })
  vi.stubGlobal('window', fakeWindow)
  vi.stubGlobal('document', fakeDocument)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('visitor human-activity gate', () => {
  it('does not resolve while the page is simply open', async () => {
    const gate = observe(openGate())
    await tick()

    expect(gate.settled).toBe(false)
  })

  it.each(['pointerdown', 'click', 'keydown', 'scroll', 'touchstart', 'wheel'])(
    'resolves on a trusted %s interaction',
    async (eventName) => {
      const gate = openGate()
      fakeWindow.dispatchEvent(trustedEvent(eventName))
      await expect(gate).resolves.toBe(true)
    },
  )

  it('does not treat hovering as an interaction', async () => {
    const gate = observe(openGate())

    fakeWindow.dispatchEvent(trustedEvent('pointermove'))
    fakeWindow.dispatchEvent(trustedEvent('mousemove'))
    await tick()

    expect(gate.settled).toBe(false)
  })

  it('ignores synthetic events that scripts dispatch', async () => {
    const gate = observe(openGate())

    fakeWindow.dispatchEvent(untrustedEvent('scroll'))
    fakeWindow.dispatchEvent(untrustedEvent('click'))
    await tick()

    expect(gate.settled).toBe(false)
  })

  it('ignores interactions while the document is hidden', async () => {
    fakeDocument.visibilityState = 'hidden'
    const gate = observe(openGate())

    fakeWindow.dispatchEvent(trustedEvent('scroll'))
    await tick()
    expect(gate.settled).toBe(false)

    fakeDocument.visibilityState = 'visible'
    fakeWindow.dispatchEvent(trustedEvent('scroll'))
    await tick()
    expect(gate.settled).toBe(true)
    expect(gate.value).toBe(true)
  })

  it('ignores a bare scroll while the page is still opening', async () => {
    let clock = 0
    const gate = observe(openGate({ now: () => clock, scrollGraceMs: 1_500 }))

    fakeWindow.dispatchEvent(trustedEvent('scroll'))
    await tick()
    expect(gate.settled).toBe(false)

    clock = 2_000
    fakeWindow.dispatchEvent(trustedEvent('scroll'))
    await tick()
    expect(gate.settled).toBe(true)
    expect(gate.value).toBe(true)
  })

  it('counts a real gesture immediately even during the grace period', async () => {
    const gate = waitForHumanActivity({ now: () => 0, scrollGraceMs: 1_500 })
    fakeWindow.dispatchEvent(trustedEvent('wheel'))
    await expect(gate).resolves.toBe(true)
  })

  it('resolves false when the visitor leaves before interacting', async () => {
    const gate = openGate()
    fakeWindow.dispatchEvent(trustedEvent('pagehide'))
    await expect(gate).resolves.toBe(false)
  })

  it('stops listening once it has resolved', async () => {
    const removeEventListener = vi.spyOn(fakeWindow, 'removeEventListener')
    const gate = openGate()

    fakeWindow.dispatchEvent(trustedEvent('scroll'))
    await expect(gate).resolves.toBe(true)

    expect(removeEventListener).toHaveBeenCalled()
  })

  it('treats a cross-origin or embedded document as ineligible', () => {
    const embeddedWindow = Object.assign(new EventTarget(), {})
    Object.defineProperty(embeddedWindow, 'self', { value: embeddedWindow })
    Object.defineProperty(embeddedWindow, 'top', { value: {} })
    vi.stubGlobal('window', embeddedWindow)

    expect(isIneligibleDocumentContext()).toBe(true)
  })
})
