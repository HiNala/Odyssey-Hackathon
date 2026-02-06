/**
 * Input sanitization and validation utilities.
 * Prevents XSS, enforces length limits, and validates user input.
 */

const MAX_PROMPT_LENGTH = 500;
const MAX_CHARACTER_LENGTH = 200;
const MAX_WORLD_LENGTH = 200;

/**
 * Strip HTML tags and dangerous characters from user input.
 */
export function sanitizeInput(input: string, maxLength = MAX_PROMPT_LENGTH): string {
  return input
    .replace(/[<>]/g, '')           // Remove angle brackets (prevent HTML injection)
    .replace(/javascript:/gi, '')   // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '')     // Remove inline event handlers
    .slice(0, maxLength)
    .trim();
}

/**
 * Validate a character description.
 */
export function validateCharacterInput(value: string): { valid: boolean; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Character description is required' };
  if (trimmed.length < 3) return { valid: false, error: 'Must be at least 3 characters' };
  if (trimmed.length > MAX_CHARACTER_LENGTH) return { valid: false, error: `Max ${MAX_CHARACTER_LENGTH} characters` };
  return { valid: true };
}

/**
 * Validate a world description.
 */
export function validateWorldInput(value: string): { valid: boolean; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'World description is required' };
  if (trimmed.length < 3) return { valid: false, error: 'Must be at least 3 characters' };
  if (trimmed.length > MAX_WORLD_LENGTH) return { valid: false, error: `Max ${MAX_WORLD_LENGTH} characters` };
  return { valid: true };
}

/**
 * Validate a battle action prompt.
 */
export function validatePrompt(value: string): { valid: boolean; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Action cannot be empty' };
  if (trimmed.length < 3) return { valid: false, error: 'Must be at least 3 characters' };
  if (trimmed.length > MAX_PROMPT_LENGTH) return { valid: false, error: `Max ${MAX_PROMPT_LENGTH} characters` };
  return { valid: true };
}
