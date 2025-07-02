/**
 * AI Models configuration
 * Contains available AI models for OpenRouter API
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  recommended?: boolean;
}

/**
 * List of popular AI models available through OpenRouter
 */
export const AI_MODELS: AIModel[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Наиболее сбалансированная модель для анализа текста и поиска',
    recommended: true
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Мощная модель OpenAI с отличным пониманием контекста'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Быстрая и экономичная версия GPT-4o'
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Google: Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Продвинутая модель Google с большим контекстным окном'
  }
];

/**
 * Get AI model by ID
 */
export function getAIModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(model => model.id === id);
}

/**
 * Get recommended AI model
 */
export function getRecommendedAIModel(): AIModel {
  return AI_MODELS.find(model => model.recommended) || AI_MODELS[0];
}

/**
 * Validate AI model ID format
 */
export function validateAIModelId(modelId: string): boolean {
  // Basic validation for model ID format (provider/model-name)
  return modelId.length > 0 && /^[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_.]+$/.test(modelId);
}

/**
 * Check if model is in predefined list
 */
export function isKnownAIModel(modelId: string): boolean {
  return AI_MODELS.some(model => model.id === modelId);
}