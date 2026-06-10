/**
 * Core type definitions for the survey form workflow
 */

/**
 * Question types supported by the survey system
 */
export type QuestionType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'select' 
  | 'multiselect' 
  | 'radio' 
  | 'checkbox' 
  | 'textarea' 
  | 'date' 
  | 'time' 
  | 'range';

/**
 * Comparison operators for conditional rules
 */
export type ComparisonOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'greaterThanOrEqual' 
  | 'lessThanOrEqual' 
  | 'contains' 
  | 'notContains' 
  | 'startsWith' 
  | 'endsWith' 
  | 'in' 
  | 'notIn' 
  | 'isEmpty' 
  | 'isNotEmpty';

/**
 * Logical operators for combining multiple conditions
 */
export type LogicalOperator = 'AND' | 'OR' | 'NOT';

/**
 * Actions that can be triggered by conditional logic
 */
export type ConditionalAction = 
  | 'show' 
  | 'hide' 
  | 'enable' 
  | 'disable' 
  | 'require' 
  | 'unrequire' 
  | 'clear';

/**
 * Basic condition for evaluating field values
 */
export interface Condition {
  fieldId: string;
  operator: ComparisonOperator;
  value: any;
}

/**
 * Complex condition supporting logical operators and nested conditions
 */
export interface ComplexCondition {
  operator: LogicalOperator;
  conditions: (Condition | ComplexCondition)[];
}

/**
 * Rule that defines when and what actions to take
 */
export interface ConditionalRule {
  id: string;
  condition: Condition | ComplexCondition;
  actions: RuleAction[];
  priority?: number;
}

/**
 * Action to be executed when a rule condition is met
 */
export interface RuleAction {
  action: ConditionalAction;
  targetFieldId: string;
  metadata?: Record<string, any>;
}

/**
 * Option for select, multiselect, and radio questions
 */
export interface SelectOption {
  id: string;
  label: string;
  value: any;
  description?: string;
}

/**
 * Base question properties
 */
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  metadata?: Record<string, any>;
}

/**
 * Question with conditional visibility/state rules
 */
export interface ConditionalQuestion extends BaseQuestion {
  visible?: boolean;
  enabled?: boolean;
  rules?: ConditionalRule[];
  dependsOn?: string[];
}

/**
 * Text input question
 */
export interface TextQuestion extends ConditionalQuestion {
  type: 'text';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

/**
 * Number input question
 */
export interface NumberQuestion extends ConditionalQuestion {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Email input question
 */
export interface EmailQuestion extends ConditionalQuestion {
  type: 'email';
}

/**
 * Textarea question
 */
export interface TextareaQuestion extends ConditionalQuestion {
  type: 'textarea';
  minLength?: number;
  maxLength?: number;
  rows?: number;
}

/**
 * Select dropdown question
 */
export interface SelectQuestion extends ConditionalQuestion {
  type: 'select';
  options: SelectOption[];
  multiple?: false;
  clearable?: boolean;
}

/**
 * Multi-select question
 */
export interface MultiSelectQuestion extends ConditionalQuestion {
  type: 'multiselect';
  options: SelectOption[];
  multiple: true;
  minSelected?: number;
  maxSelected?: number;
}

/**
 * Radio button question
 */
export interface RadioQuestion extends ConditionalQuestion {
  type: 'radio';
  options: SelectOption[];
}

/**
 * Checkbox question
 */
export interface CheckboxQuestion extends ConditionalQuestion {
  type: 'checkbox';
  options?: SelectOption[];
}

/**
 * Date input question
 */
export interface DateQuestion extends ConditionalQuestion {
  type: 'date';
  minDate?: string;
  maxDate?: string;
}

/**
 * Time input question
 */
export interface TimeQuestion extends ConditionalQuestion {
  type: 'time';
}

/**
 * Range slider question
 */
export interface RangeQuestion extends ConditionalQuestion {
  type: 'range';
  min: number;
  max: number;
  step?: number;
  labels?: Record<string, string>;
}

/**
 * Union type for all question types
 */
export type Question = 
  | TextQuestion 
  | NumberQuestion 
  | EmailQuestion 
  | TextareaQuestion 
  | SelectQuestion 
  | MultiSelectQuestion 
  | RadioQuestion 
  | CheckboxQuestion 
  | DateQuestion 
  | TimeQuestion 
  | RangeQuestion;

/**
 * Section grouping related questions
 */
export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  visible?: boolean;
  rules?: ConditionalRule[];
}

/**
 * Complete survey definition
 */
export interface Survey {
  id: string;
  title: string;
  description?: string;
  version: string;
  sections: SurveySection[];
  globalRules?: ConditionalRule[];
  metadata?: Record<string, any>;
}

/**
 * User response to a single question
 */
export interface FieldResponse {
  fieldId: string;
  value: any;
  timestamp: number;
  valid: boolean;
  errors?: string[];
}

/**
 * Complete survey responses
 */
export interface SurveyResponse {
  surveyId: string;
  responses: Record<string, FieldResponse>;
  startTime: number;
  lastUpdated: number;
  submitted?: boolean;
  submittedAt?: number;
}

/**
 * Field state management
 */
export interface FieldState {
  fieldId: string;
  visible: boolean;
  enabled: boolean;
  required: boolean;
  value: any;
  errors: string[];
  touched: boolean;
  dirty: boolean;
}

/**
 * Survey state management
 */
export interface SurveyState {
  surveyId: string;
  fieldStates: Record<string, FieldState>;
  evaluatedRules: Set<string>;
  lastEvaluated: number;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validation context
 */
export interface ValidationContext {
  value: any;
  field: Question;
  survey?: Survey;
  responses?: SurveyResponse;
}

/**
 * Custom validator function
 */
export type ValidatorFunction = (context: ValidationContext) => ValidationResult;

/**
 * Validator configuration
 */
export interface Validator {
  id: string;
  name: string;
  validate: ValidatorFunction;
}
