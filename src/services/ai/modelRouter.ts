import type { AITask, ModelCapability } from '../../types/ai'
import { fallbackManager, requiredCapability, taskCategory } from './fallbackManager'
import { modelRegistry } from './modelRegistry'

export type RouteHint = 'fast' | 'reasoning' | 'structured' | 'vision' | 'balanced'

export interface RouteRequest {
  task: AITask
  hint?: RouteHint
  hasImages?: boolean
}

export interface RouteResult {
  chain: string[]
  capability: ModelCapability
  autoFailover: boolean
  preferred?: string
}

/**
 * Task-based routing. Every AI operation asks the router for a chain;
 * models that cannot perform the required operation are excluded.
 */
export class ModelRouter {
  route(req: RouteRequest): RouteResult {
    const task = req.task
    const cap = requiredCapability(task)
    const category = taskCategory(task)
    let chain = fallbackManager.buildChain(task)

    // Extra capability requirements from the actual payload.
    if (req.hasImages && category === 'text') {
      const discovered = modelRegistry.getModels()
      const visionIds = new Set(discovered.filter((m) => m.capabilities.includes('vision') && !m.deprecated).map((m) => m.id))
      if (visionIds.size) {
        const compatible = chain.filter((id) => visionIds.has(id))
        if (compatible.length) chain = compatible
      }
    }

    if (req.hint === 'reasoning' && category === 'text') {
      chain = prioritiseReasoning(chain)
    } else if (req.hint === 'fast' && category === 'text') {
      chain = prioritiseFast(chain)
    } else if (req.hint === 'structured' && category === 'text') {
      chain = prioritiseStructured(chain)
    }

    return {
      chain,
      capability: cap,
      autoFailover: fallbackManager.getPolicy().autoFailover,
      preferred: fallbackManager.getPolicy().preferredModel,
    }
  }
}

function models() { return modelRegistry.getModels() }

function prioritiseReasoning(chain: string[]): string[] {
  const ranked = chain.filter((id) => {
    const m = modelRegistry.getModel(id)
    return m?.capabilities.includes('reasoning') || /pro|reasoning/i.test(id)
  })
  return [...ranked, ...chain.filter((id) => !ranked.includes(id))]
}

function prioritiseFast(chain: string[]): string[] {
  const ranked = chain.filter((id) => /flash|lite|nano/i.test(id))
  return [...ranked, ...chain.filter((id) => !ranked.includes(id))]
}

function prioritiseStructured(chain: string[]): string[] {
  const discovered = models()
  const structured = new Set(discovered.filter((m) => m.capabilities.includes('structured-output') && !m.deprecated).map((m) => m.id))
  if (!structured.size) return chain
  const ranked = chain.filter((id) => structured.has(id))
  return [...ranked, ...chain.filter((id) => !ranked.includes(id))]
}

export const modelRouter = new ModelRouter()
