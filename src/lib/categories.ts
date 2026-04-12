import { CategoryConfig, CategoryKey } from '@/types'

export const categoryConfig: Record<string, CategoryConfig> = {
  bar: { emoji: '☕', color: '#F59E0B', label: 'Bar', plural: 'caffè' },
  ristorante: { emoji: '🍽️', color: '#EF4444', label: 'Ristorante', plural: 'pranzi' },
  pizzeria: { emoji: '🍕', color: '#F97316', label: 'Pizzeria', plural: 'pizze' },
  parrucchiere: { emoji: '✂️', color: '#8B5CF6', label: 'Parrucchiere', plural: 'tagli' },
  estetista: { emoji: '💅', color: '#EC4899', label: 'Estetista', plural: 'trattamenti' },
  palestra: { emoji: '💪', color: '#10B981', label: 'Palestra', plural: 'allenamenti' },
  negozio: { emoji: '🛍️', color: '#3B82F6', label: 'Negozio', plural: 'acquisti' },
  farmacia: { emoji: '💊', color: '#06B6D4', label: 'Farmacia', plural: 'visite' },
  supermercato: { emoji: '🛒', color: '#6366F1', label: 'Supermercato', plural: 'spese' },
  other: { emoji: '⭐', color: '#7C3AED', label: 'Negozio', plural: 'visite' },
}

export const getCategoryConfig = (category: string): CategoryConfig => {
  return categoryConfig[category] || categoryConfig.other
}
