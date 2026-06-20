export type Locale = "tr" | "en"

export type TranslationDict = typeof import("./dicts/en.json")

export type TranslationKey = keyof TranslationDict

export type TranslationParams = Record<string, string | number>
