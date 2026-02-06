/**
 * Input sanitization and validation utilities.
 * Prevents XSS, prompt injection, enforces length limits, and validates user input.
 */

const MAX_PROMPT_LENGTH = 500;
const MAX_CHARACTER_LENGTH = 200;
const MAX_WORLD_LENGTH = 200;

/** Patterns that indicate prompt injection attempts */
const PROMPT_INJECTION_PATTERNS = [
  'ignore previous instructions',
  'ignore all previous',
  'disregard all previous',
  'forget everything',
  'forget your instructions',
  'system:',
  'assistant:',
  'user:',
  '<|',
  '|>',
  '\\[INST\\]',
  '\\[/INST\\]',
  'you are now',
  'act as if',
  'pretend you are',
  'new instructions:',
  'override:',
];

/**
 * Comprehensive HTML entity encoding for XSS prevention.
 */
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Detect potential prompt injection attacks.
 * Returns true if the input appears safe.
 */
export function isPromptSafe(input: string): boolean {
  const lower = input.toLowerCase();
  return !PROMPT_INJECTION_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Strip HTML tags and dangerous characters from user input.
 * Enhanced with prompt injection detection.
 */
export function sanitizeInput(input: string, maxLength = MAX_PROMPT_LENGTH): string {
  return input
    .replace(/[<>]/g, '')           // Remove angle brackets (prevent HTML injection)
    .replace(/javascript:/gi, '')   // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '')     // Remove inline event handlers
    .replace(/data:/gi, '')         // Remove data: protocol
    .replace(/vbscript:/gi, '')     // Remove vbscript: protocol
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .slice(0, maxLength)
    .trim();
}

/**
 * Sanitize a prompt specifically — includes injection detection.
 */
export function sanitizePrompt(input: string, maxLength = MAX_PROMPT_LENGTH): { sanitized: string; safe: boolean } {
  const sanitized = sanitizeInput(input, maxLength);
  const safe = isPromptSafe(sanitized);
  return { sanitized, safe };
}

/**
 * Validate a character description.
 */
export function validateCharacterInput(value: string): { valid: boolean; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Character description is required' };
  if (trimmed.length < 3) return { valid: false, error: 'Must be at least 3 characters' };
  if (trimmed.length > MAX_CHARACTER_LENGTH) return { valid: false, error: `Max ${MAX_CHARACTER_LENGTH} characters` };
  if (!isPromptSafe(trimmed)) return { valid: false, error: 'Input contains prohibited content' };
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
  if (!isPromptSafe(trimmed)) return { valid: false, error: 'Input contains prohibited content' };
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
  if (!isPromptSafe(trimmed)) return { valid: false, error: 'Input contains prohibited content' };
  return { valid: true };
}
