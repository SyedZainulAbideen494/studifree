import type { AITask, FallbackPolicy, ModelCapability } from '../../types/ai'
import { modelRegistry } from './modelRegistry'

const POLICY_KEY = 'studifree:ai:fallback-policy'

export type ChainCategory = 'text' | 'image' | 'audio' | 'embedding'

export interface StoredPolicy {
  autoFailover: boolean
  preferredModel: string
  disabled: string[]
  textOrder: string[]
  imageOrder: string[]
  audioOrder: string[]
  embeddingOrder: string[]
}

/** Conservative bootstrap IDs used only before discovery has ever succeeded. */
const BOOTSTRAP_TEXT = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
const BOOTSTRAP_IMAGE = ['gemini-2.5-flash-image', 'gemini-2.0-flash-preview-image-generation']
const BOOTSTRAP_AUDIO = ['gemini-2.5-flash-preview-tts', 'gemini-2.0-flash-live-001']
const BOOTSTRAP_EMBED = ['gemini-embedding-001', 'text-embedding-004']

function defaults(): StoredPolicy {
  return {
    autoFailover: true,
    preferredModel: 'gemini-2.5-flash',
    disabled: [],
    textOrder: [],
    imageOrder: [],
    audioOrder: [],
    embeddingOrder: [],
  }
}

function load(): StoredPolicy {
  try {
    const raw = localStorage.getItem(POLICY_KEY)
    if (!raw) return defaults()
    return { ...defaults(), ...JSON.parse(raw) }
  } catch { return defaults() }
}

function save(p: StoredPolicy) {
  try { localStorage.setItem(POLICY_KEY, JSON.stringify(p)) } catch { /* ignore */ }
}

export function taskCategory(task: AITask): ChainCategory {
  switch (task) {
    case 'image-generate': return 'image'
    case 'transcription':
    case 'tts': return 'audio'
    case 'embedding': return 'embedding'
    default: return 'text'
  }
}

export function requiredCapability(task: AITask): ModelCapability {
  switch (task) {
    case 'image-generate': return 'image-generation'
    case 'transcription': return 'audio-transcription'
    case 'tts': return 'tts'
    case 'embedding': return 'embedding'
    case 'image-understand': return 'vision'
    case 'pdf': return 'vision'
    default: return 'text'
  }
}

export class FallbackManager {
  private policy = load()
  private listeners = new Set<() => void>()

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }
  private emit() { this.listeners.forEach((l) => l()) }

  getPolicy(): StoredPolicy { return { ...this.policy, disabled: [...this.policy.disabled] } }

  setPolicy(patch: Partial<StoredPolicy>) {
    this.policy = { ...this.policy, ...patch }
    save(this.policy)
    this.emit()
  }

  setPreferredModel(id: string) { this.setPolicy({ preferredModel: id }) }
  setAutoFailover(v: boolean) { this.setPolicy({ autoFailover: v }) }
  toggleDisabled(id: string) {
    const set = new Set(this.policy.disabled)
    if (set.has(id)) set.delete(id); else set.add(id)
    this.setPolicy({ disabled: [...set] })
  }
  restoreDefaults() {
    this.policy = defaults()
    save(this.policy)
    this.emit()
  }

  private orderFor(category: ChainCategory): string[] {
    switch (category) {
      case 'image': return this.policy.imageOrder
      case 'audio': return this.policy.audioOrder
      case 'embedding': return this.policy.embeddingOrder
      default: return this.policy.textOrder
    }
  }

  setOrder(category: ChainCategory, order: string[]) {
    if (category === 'image') this.setPolicy({ imageOrder: order })
    else if (category === 'audio') this.setPolicy({ audioOrder: order })
    else if (category === 'embedding') this.setPolicy({ embeddingOrder: order })
    else this.setPolicy({ textOrder: order })
  }

  /** Build an ordered list of compatible model IDs for a task. */
  buildChain(task: AITask): string[] {
    const category = taskCategory(task)
    const cap = requiredCapability(task)
    const discovered = modelRegistry.getModels()
    const compatible = discovered.filter((m) => !m.deprecated && m.capabilities.includes(cap))
    const disabled = new Set(this.policy.disabled)

    let chain: string[] = []
    const preferred = this.policy.preferredModel
    // Preferred model only joins a chain it can actually serve.
    const preferredCompatible =
      category === 'text' ? true : compatible.some((m) => m.id === preferred)
    if (preferred && !disabled.has(preferred) && preferredCompatible) chain.push(preferred)

    const custom = this.orderFor(category).filter((id) => !disabled.has(id))
    chain.push(...custom)

    if (compatible.length) {
      // rank discovered compatible models for the capability
      const ranked = [...compatible].sort((a, b) => scoreModel(a, cap) - scoreModel(b, cap))
      chain.push(...ranked.map((m) => m.id))
    } else {
      // no discovery yet: conservative bootstrap list
      const boot = category === 'image' ? BOOTSTRAP_IMAGE : category === 'audio' ? BOOTSTRAP_AUDIO : category === 'embedding' ? BOOTSTRAP_EMBED : BOOTSTRAP_TEXT
      chain.push(...boot)
    }

    chain = chain.filter((id) => !disabled.has(id))
    if (compatible.length) {
      // ensure only compatible models remain (custom/bootstrap may reference incompatible models)
      const compatibleIds = new Set(compatible.map((m) => m.id))
      chain = chain.filter((id) => compatibleIds.has(id))
    }
    if (!chain.length && compatible.length) chain = compatible.map((m) => m.id)
    return [...new Set(chain)]
  }

  /** Human-friendly policy for the UI. */
  describe(task: AITask): FallbackPolicy {
    return {
      task,
      autoFailover: this.policy.autoFailover,
      preferredModel: this.policy.preferredModel,
      chain: this.buildChain(task),
      disabled: [...this.policy.disabled],
    }
  }
}

function scoreModel(m: { category: string; id: string }, cap: ModelCapability): number {
  let s = 100
  if (cap === 'text') {
    if (m.category === 'general') s -= 30
    else if (m.category === 'fast') s -= 20
    else if (m.category === 'advanced-reasoning') s -= 5
    else s += 30
    if (/flash/.test(m.id)) s -= 5
    if (/lite/.test(m.id)) s += 8
  } else if (cap === 'vision') {
    if (/flash/.test(m.id)) s -= 20
    if (/pro/.test(m.id)) s -= 10
  } else if (cap === 'image-generation') {
    if (/image|imagen|nano/.test(m.id)) s -= 20
  } else if (cap === 'tts' || cap === 'audio-transcription') {
    if (/tts|audio|live/.test(m.id)) s -= 20
  } else if (cap === 'embedding') {
    if (/embedding/.test(m.id)) s -= 20
  }
  return s
}

export const fallbackManager = new FallbackManager()
