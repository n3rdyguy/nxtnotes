import type { ZodSchema } from "zod";

/**
 * Composable for client-side form validation using Zod
 */
export function useValidation<T>(schema: ZodSchema<T>) {
  const errors = ref<Record<string, string>>({});
  const isValid = ref(true);

  /**
   * Validate data against the schema
   * Returns true if valid, false otherwise
   * Populates errors object with field-specific error messages
   */
  function validate(data: unknown): data is T {
    const result = schema.safeParse(data);

    if (result.success) {
      errors.value = {};
      isValid.value = true;
      return true;
    }

    // Convert Zod errors to field-specific error messages
    const fieldErrors: Record<string, string> = {};
    for (const err of result.error.issues) {
      const field = err.path.join(".");
      if (!fieldErrors[field]) {
        fieldErrors[field] = err.message;
      }
    }

    errors.value = fieldErrors;
    isValid.value = false;
    return false;
  }

  /**
   * Get error message for a specific field
   */
  function getError(field: string): string | undefined {
    return errors.value[field];
  }

  /**
   * Check if a specific field has an error
   */
  function hasError(field: string): boolean {
    return !!errors.value[field];
  }

  /**
   * Clear all errors
   */
  function clearErrors(): void {
    errors.value = {};
    isValid.value = true;
  }

  /**
   * Clear error for a specific field
   */
  function clearError(field: string): void {
    const newErrors = { ...errors.value };
    delete newErrors[field];
    errors.value = newErrors;
    isValid.value = Object.keys(newErrors).length === 0;
  }

  return {
    errors: readonly(errors),
    isValid: readonly(isValid),
    validate,
    getError,
    hasError,
    clearErrors,
    clearError,
  };
}
