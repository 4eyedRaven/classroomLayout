// src/utils/idGenerator.ts
export const generateUniqueId = (): string => '_' + Math.random().toString(36).substr(2, 9);