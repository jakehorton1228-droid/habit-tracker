/**
 * Application Constants
 *
 * Centralized configuration for categories, prompts, and options used
 * throughout the application. These constants define the available choices
 * for habits, goals, and journal entries.
 *
 * Note: Category IDs must match the backend model choices to ensure
 * proper data consistency between frontend and backend.
 *
 * @module utils/constants
 */

/**
 * Habit categories for organizing and filtering habits.
 *
 * Each category has a unique ID that matches the backend Habit.CATEGORY_CHOICES,
 * a display name, and a color for visual identification.
 *
 * @type {Array<{id: string, name: string, color: string}>}
 *
 * @example
 * import { categories } from './utils/constants'
 * const healthCategory = categories.find(c => c.id === 'health')
 * // { id: 'health', name: 'Health', color: '#ff6b6b' }
 */
export const categories = [
  { id: 'health', name: 'Health', color: '#ff6b6b' },
  { id: 'learning', name: 'Learning', color: '#a855f7' },
  { id: 'mindfulness', name: 'Mindfulness', color: '#22c55e' },
  { id: 'productivity', name: 'Productivity', color: '#3b82f6' },
  { id: 'social', name: 'Social', color: '#fbbf24' },
]

/**
 * Goal categories for organizing and filtering goals.
 *
 * Similar to habit categories but includes emoji icons for richer
 * visual display in the goals interface.
 *
 * @type {Array<{id: string, name: string, color: string, icon: string}>}
 *
 * @example
 * import { goalCategories } from './utils/constants'
 * const financeCategory = goalCategories.find(c => c.id === 'finance')
 * // { id: 'finance', name: 'Finance', color: '#22c55e', icon: '💰' }
 */
export const goalCategories = [
  { id: 'fitness', name: 'Fitness', color: '#ff6b6b', icon: '💪' },
  { id: 'learning', name: 'Learning', color: '#a855f7', icon: '📚' },
  { id: 'finance', name: 'Finance', color: '#22c55e', icon: '💰' },
  { id: 'career', name: 'Career', color: '#3b82f6', icon: '💼' },
  { id: 'personal', name: 'Personal', color: '#fbbf24', icon: '⭐' },
]

/**
 * Journal prompts for guided/structured entries.
 *
 * These prompts appear in the "Prompted" journal entry mode and help
 * users reflect on their day with structured questions. The prompt IDs
 * are used as keys in the journal entry's `responses` JSON field.
 *
 * @type {Array<{id: string, label: string, icon: string}>}
 *
 * @example
 * // In journal entry creation
 * const responses = {
 *   wins: "Completed my project",
 *   grateful: "Good weather today"
 * }
 */
export const journalPrompts = [
  { id: 'wins', label: 'What went well today?', icon: '✨' },
  { id: 'challenges', label: 'What challenges did you face?', icon: '🎯' },
  { id: 'grateful', label: 'What are you grateful for?', icon: '🙏' },
  { id: 'tomorrow', label: 'What will you focus on tomorrow?', icon: '🚀' },
]

/**
 * Mood options for journal entries.
 *
 * Each mood option has a unique ID that matches the backend JournalEntry.MOOD_CHOICES,
 * a display label, an emoji for visual representation, and a color for styling.
 * Moods are ordered from most positive to most negative.
 *
 * @type {Array<{id: string, label: string, emoji: string, color: string}>}
 *
 * @example
 * import { moodOptions } from './utils/constants'
 * const currentMood = moodOptions.find(m => m.id === entry.mood)
 * // { id: 'good', label: 'Good', emoji: '🙂', color: '#3b82f6' }
 */
export const moodOptions = [
  { id: 'great', label: 'Great', emoji: '😊', color: '#22c55e' },
  { id: 'good', label: 'Good', emoji: '🙂', color: '#3b82f6' },
  { id: 'okay', label: 'Okay', emoji: '😐', color: '#fbbf24' },
  { id: 'low', label: 'Low', emoji: '😔', color: '#f97316' },
  { id: 'rough', label: 'Rough', emoji: '😢', color: '#ef4444' },
]
