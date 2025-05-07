export const SUPPORTED_LANGUAGES = ['en', 'vi', 'fr', 'es', 'ja'] as const;

export type Language = typeof SUPPORTED_LANGUAGES[number];