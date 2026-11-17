export type WorkingModel = {
  id: string
  name: string
  provider: string
}

/** Only models currently served as free on OpenRouter. */
export const WORKING_MODELS: WorkingModel[] = [
  { id: 'openrouter/free', name: 'NEXUS Auto', provider: 'OpenRouter' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B', provider: 'Google' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B', provider: 'Google' },
  { id: 'nvidia/nemotron-3.5-lightning:free', name: 'Nemotron Lightning', provider: 'NVIDIA' },
  { id: 'baidu/ernie-5.5-flash-preview:free', name: 'ERNIE 5.5 Flash', provider: 'Baidu' },
]

export const DEFAULT_MODEL_ID = WORKING_MODELS[0].id

export function isWorkingModel(id: string) {
  return WORKING_MODELS.some((model) => model.id === id)
}

export function workingModelIds() {
  return WORKING_MODELS.map((model) => model.id)
}
