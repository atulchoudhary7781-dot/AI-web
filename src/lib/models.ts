export type WorkingModel = {
  id: string
  name: string
  provider: string
}

/** Live OpenRouter free chat models only (no paid, deprecated, or audio). */
export const WORKING_MODELS: WorkingModel[] = [
  { id: 'openrouter/free', name: 'NEXUS Auto', provider: 'OpenRouter' },
  { id: 'inclusionai/ling-3.2-flash:free', name: 'Ling 3.2 Flash', provider: 'inclusionAI' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B', provider: 'Google' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B', provider: 'Google' },
  { id: 'nvidia/nemotron-3.5-lightning:free', name: 'Nemotron Lightning', provider: 'NVIDIA' },
  { id: 'recursive/flint-v1.0:free', name: 'Flint', provider: 'Recursive' },
  { id: 'liquid/lfm-3-1.7b:free', name: 'LFM 1.7B', provider: 'LiquidAI' },
]

export const DEFAULT_MODEL_ID = WORKING_MODELS[0].id

export function isWorkingModel(id: string) {
  return WORKING_MODELS.some((model) => model.id === id)
}

export function workingModelIds() {
  return WORKING_MODELS.map((model) => model.id)
}

export function isOpenRouterFreeModel(id: string) {
  return id === 'openrouter/free' || id.endsWith(':free')
}
