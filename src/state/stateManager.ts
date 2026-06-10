import { FieldState, Survey, SurveyResponse, SurveyState } from '../types';
import { SurveyRuleEngine, initializeSurveyState } from './ruleEngine';
import { validateField } from '../validators/fieldValidator';

/**
 * State manager for survey responses and field states
 */
export class SurveyStateManager {
  private ruleEngine: SurveyRuleEngine;
  private responseHistory: SurveyResponse[] = [];
  private maxHistorySize: number = 50;

  constructor() {
    this.ruleEngine = new SurveyRuleEngine();
  }

  /**
   * Initializes survey state
   */
  initializeSurvey(survey: Survey): SurveyState {
    return initializeSurveyState(survey);
  }

  /**
   * Updates a single field value and re-evaluates rules
   */
  updateFieldValue(
    survey: Survey,
    fieldId: string,
    value: any,
    state: SurveyState,
    responses: SurveyResponse
  ): { state: SurveyState; responses: SurveyResponse } {
    // Update responses
    const updatedResponses = { ...responses };
    const question = this.findQuestion(survey, fieldId);

    if (!question) {
      throw new Error(`Question with ID ${fieldId} not found`);
    }

    const validationResult = validateField(question, value);

    updatedResponses.responses[fieldId] = {
      fieldId,
      value,
      timestamp: Date.now(),
      valid: validationResult.valid,
      errors: validationResult.errors,
    };

    updatedResponses.lastUpdated = Date.now();

    // Update field state
    const updatedState = { ...state };
    updatedState.fieldStates[fieldId].value = value;
    updatedState.fieldStates[fieldId].dirty = true;
    updatedState.fieldStates[fieldId].touched = true;
    updatedState.fieldStates[fieldId].errors = validationResult.errors;

    // Re-evaluate rules
    const finalState = this.ruleEngine.evaluateRules(survey, updatedResponses, updatedState);

    // Add to history
    this.addToHistory(updatedResponses);

    return { state: finalState, responses: updatedResponses };
  }

  /**
   * Updates multiple field values
   */
  updateMultipleFields(
    survey: Survey,
    updates: Record<string, any>,
    state: SurveyState,
    responses: SurveyResponse
  ): { state: SurveyState; responses: SurveyResponse } {
    let currentState = state;
    let currentResponses = responses;

    Object.entries(updates).forEach(([fieldId, value]) => {
      const result = this.updateFieldValue(survey, fieldId, value, currentState, currentResponses);
      currentState = result.state;
      currentResponses = result.responses;
    });

    return { state: currentState, responses: currentResponses };
  }

  /**
   * Resets a field to its initial state
   */
  resetField(
    fieldId: string,
    state: SurveyState,
    responses: SurveyResponse
  ): { state: SurveyState; responses: SurveyResponse } {
    const updatedState = { ...state };
    const updatedResponses = { ...responses };

    updatedState.fieldStates[fieldId].value = null;
    updatedState.fieldStates[fieldId].dirty = false;
    updatedState.fieldStates[fieldId].touched = false;
    updatedState.fieldStates[fieldId].errors = [];

    updatedResponses.responses[fieldId] = {
      fieldId,
      value: null,
      timestamp: Date.now(),
      valid: true,
      errors: [],
    };

    return { state: updatedState, responses: updatedResponses };
  }

  /**
   * Resets entire survey
   */
  resetSurvey(
    survey: Survey,
    state: SurveyState,
    responses: SurveyResponse
  ): { state: SurveyState; responses: SurveyResponse } {
    const newState = this.initializeSurvey(survey);
    const newResponses: SurveyResponse = {
      surveyId: survey.id,
      responses: {},
      startTime: Date.now(),
      lastUpdated: Date.now(),
    };

    survey.sections.forEach((section) => {
      section.questions.forEach((question) => {
        newResponses.responses[question.id] = {
          fieldId: question.id,
          value: null,
          timestamp: Date.now(),
          valid: true,
          errors: [],
        };
      });
    });

    return { state: newState, responses: newResponses };
  }

  /**
   * Re-evaluates all rules without changing values
   */
  evaluateRules(
    survey: Survey,
    state: SurveyState,
    responses: SurveyResponse
  ): SurveyState {
    return this.ruleEngine.evaluateRules(survey, responses, state);
  }

  /**
   * Gets visibility state for a field
   */
  isFieldVisible(fieldId: string, state: SurveyState): boolean {
    const fieldState = state.fieldStates[fieldId];
    return fieldState?.visible ?? true;
  }

  /**
   * Gets enabled state for a field
   */
  isFieldEnabled(fieldId: string, state: SurveyState): boolean {
    const fieldState = state.fieldStates[fieldId];
    return fieldState?.enabled ?? true;
  }

  /**
   * Gets required state for a field
   */
  isFieldRequired(fieldId: string, state: SurveyState): boolean {
    const fieldState = state.fieldStates[fieldId];
    return fieldState?.required ?? false;
  }

  /**
   * Gets validation errors for a field
   */
  getFieldErrors(fieldId: string, state: SurveyState): string[] {
    const fieldState = state.fieldStates[fieldId];
    return fieldState?.errors ?? [];
  }

  /**
   * Gets all visible fields
   */
  getVisibleFields(survey: Survey, state: SurveyState): string[] {
    return survey.sections
      .flatMap((section) => section.questions)
      .filter((question) => this.isFieldVisible(question.id, state))
      .map((question) => question.id);
  }

  /**
   * Undoes the last action
   */
  undo(
    state: SurveyState,
    responses: SurveyResponse
  ): { state: SurveyState; responses: SurveyResponse } | null {
    if (this.responseHistory.length < 2) {
      return null;
    }

    // Pop current
    this.responseHistory.pop();
    // Get previous
    const previousResponses = this.responseHistory[this.responseHistory.length - 1];

    return { state, responses: previousResponses };
  }

  /**
   * Gets field value
   */
  getFieldValue(fieldId: string, state: SurveyState): any {
    const fieldState = state.fieldStates[fieldId];
    return fieldState?.value ?? null;
  }

  /**
   * Checks if survey is valid
   */
  isSurveyValid(state: SurveyState): boolean {
    return state.isValid;
  }

  /**
   * Finds a question by ID in the survey
   */
  private findQuestion(survey: Survey, fieldId: string) {
    for (const section of survey.sections) {
      for (const question of section.questions) {
        if (question.id === fieldId) {
          return question;
        }
      }
    }
    return null;
  }

  /**
   * Adds response to history
   */
  private addToHistory(responses: SurveyResponse): void {
    this.responseHistory.push({ ...responses });
    if (this.responseHistory.length > this.maxHistorySize) {
      this.responseHistory.shift();
    }
  }

  /**
   * Clears history
   */
  clearHistory(): void {
    this.responseHistory = [];
  }

  /**
   * Gets history
   */
  getHistory(): SurveyResponse[] {
    return [...this.responseHistory];
  }
}
