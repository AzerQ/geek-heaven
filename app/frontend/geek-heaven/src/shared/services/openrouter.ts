/**
 * OpenRouter API service for AI-powered movie search
 * Provides integration with OpenRouter's language models for movie recommendations
 */

import { settings } from '../stores/settings';
import { get } from 'svelte/store';

// Types for OpenRouter API
export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Types for movie suggestions
export interface MovieSuggestion {
  title: string;
  type: 'movie' | 'tv-series' | 'cartoon' | 'anime';
  description: string;
  confidence: number;
}

export interface AISearchResponse {
  suggestions: MovieSuggestion[];
}

class OpenRouterService {
  private apiKey: string = '';
  private baseUrl = 'https://openrouter.ai/api/v1';

  public maxTokens = 7000;

  /**
   * Get current AI model from settings
   */
  private getCurrentModel(): string {
    const currentSettings = get(settings);
    return currentSettings.aiModel || 'anthropic/claude-3.5-sonnet';
  }

  /**
   * Set API key for OpenRouter service
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Create system prompt for movie search
   */
  private createSystemPrompt(): string {
    return `Ты - эксперт по фильмам и сериалам. Твоя задача - анализировать описания пользователей и предлагать наиболее подходящие фильмы или сериалы.

Правила:
1. Анализируй описание пользователя и найди ключевые элементы (жанр, сюжет, персонажи, настроение)
2. Предложи 3-5 наиболее подходящих вариантов
3. Для каждого варианта укажи уровень уверенности от 0 до 1
4. Отвечай ТОЛЬКО в формате JSON, без дополнительного текста

Формат ответа:
{
  "suggestions": [
    {
      "title": "Точное название фильма/сериала",
      "type": "movie|tv-series|cartoon|anime",
      "description": "Краткое описание (1-2 предложения)",
      "confidence": 0.95
    }
  ]
}`;
  }

  /**
   * Search movies by description using AI
   */
  async searchByDescription(description: string): Promise<AISearchResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key не настроен');
    }

    if (!description.trim()) {
      throw new Error('Описание не может быть пустым');
    }

    const request: OpenRouterRequest = {
      model: this.getCurrentModel(),
      messages: [
        {
          role: 'system',
          content: this.createSystemPrompt()
        },
        {
          role: 'user',
          content: `Пользователь описал фильм: "${description.trim()}"`
        }
      ],
      max_tokens: this.maxTokens,
      temperature: 0.3
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Geek Heaven'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `OpenRouter API error: ${response.status} ${response.statusText}`
        );
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Нет ответа от AI модели');
      }

      const content = data.choices[0].message.content;
      
      try {
        const parsed: AISearchResponse = JSON.parse(content);
        
        // Validate response structure
        if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
          throw new Error('Неверный формат ответа от AI');
        }

        // Validate each suggestion
        const validSuggestions = parsed.suggestions.filter(suggestion => {
          return suggestion.title && 
                 suggestion.type && 
                 suggestion.description && 
                 typeof suggestion.confidence === 'number' &&
                 ['movie', 'tv-series', 'cartoon', 'anime'].includes(suggestion.type);
        });

        if (validSuggestions.length === 0) {
          throw new Error('AI не смог найти подходящие фильмы');
        }

        return {
          suggestions: validSuggestions.slice(0, 5) // Limit to 5 suggestions
        };
        
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Ошибка обработки ответа от AI');
      }
      
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ошибка при обращении к OpenRouter API');
    }
  }

  /**
   * Test API connection
   */
  async testConnection(apiKey: string): Promise<boolean> {
    if (!apiKey) {
      return false;
    }

    const currentApiKey = this.apiKey;
    try {
      this.apiKey = apiKey;
      const response = await this.searchByDescription('фильм про космос');
      return response.suggestions.length > 0;
    } catch {
      return false;
    }
    finally {
      this.apiKey = currentApiKey;
    }
  }
}

// Export singleton instance
export const openRouterService = new OpenRouterService();