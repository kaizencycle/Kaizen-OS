import { OAAIntent, ValidationResult, ValidationError, ValidationWarning } from './types';

export class OAAValidator {
  validate(intent: OAAIntent): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Required field validation
    if (!intent.title || intent.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Title is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    if (!intent.description || intent.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Description is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }

    // Priority validation
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(intent.priority)) {
      errors.push({
        field: 'priority',
        message: `Priority must be one of: ${validPriorities.join(', ')}`,
        code: 'INVALID_VALUE',
        severity: 'error'
      });
    }

    // Timeline validation
    if (intent.timeline) {
      const startDate = new Date(intent.timeline.start_date);
      const endDate = new Date(intent.timeline.end_date);
      
      if (isNaN(startDate.getTime())) {
        errors.push({
          field: 'timeline.start_date',
          message: 'Start date must be a valid date',
          code: 'INVALID_DATE',
          severity: 'error'
        });
      }

      if (isNaN(endDate.getTime())) {
        errors.push({
          field: 'timeline.end_date',
          message: 'End date must be a valid date',
          code: 'INVALID_DATE',
          severity: 'error'
        });
      }

      if (startDate >= endDate) {
        errors.push({
          field: 'timeline',
          message: 'End date must be after start date',
          code: 'INVALID_TIMELINE',
          severity: 'error'
        });
      }
    }

    // Requirements validation
    if (intent.requirements && intent.requirements.length === 0) {
      warnings.push({
        field: 'requirements',
        message: 'No requirements specified',
        suggestion: 'Consider adding at least one requirement to clarify the intent'
      });
    }

    // Success criteria validation
    if (intent.success_criteria && intent.success_criteria.length === 0) {
      warnings.push({
        field: 'success_criteria',
        message: 'No success criteria specified',
        suggestion: 'Add clear success criteria to measure intent completion'
      });
    }

    // Generate suggestions based on common patterns
    if (intent.tags && intent.tags.length === 0) {
      suggestions.push('Consider adding tags to improve categorization and searchability');
    }

    if (intent.dependencies && intent.dependencies.length === 0) {
      suggestions.push('Consider identifying dependencies to other intents or systems');
    }

    if (intent.resources && intent.resources.length === 0) {
      suggestions.push('Consider specifying required resources for intent execution');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  validateSchema(intent: any): ValidationResult {
    // Basic schema validation
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    if (typeof intent !== 'object' || intent === null) {
      errors.push({
        field: 'root',
        message: 'Intent must be an object',
        code: 'INVALID_TYPE',
        severity: 'error'
      });
      return { valid: false, errors, warnings, suggestions };
    }

    // Check for required fields
    const requiredFields = ['title', 'description', 'priority'];
    for (const field of requiredFields) {
      if (!(field in intent)) {
        errors.push({
          field,
          message: `Required field '${field}' is missing`,
          code: 'MISSING_FIELD',
          severity: 'error'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}


