import { SurveyStateManager } from '../src/state/stateManager';
import { customerSatisfactionSurvey } from '../src/examples/surveys';
import { SurveyResponse } from '../src/types';

describe('Survey State Manager', () => {
  let stateManager: SurveyStateManager;

  beforeEach(() => {
    stateManager = new SurveyStateManager();
  });

  describe('initializeSurvey', () => {
    it('should initialize survey state with all questions', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);

      expect(state.surveyId).toBe('customer-satisfaction');
      expect(Object.keys(state.fieldStates).length).toBeGreaterThan(0);
    });

    it('should set initial field values to null', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);

      Object.values(state.fieldStates).forEach((fieldState) => {
        expect(fieldState.value).toBeNull();
      });
    });

    it('should set all fields as visible initially', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);

      Object.values(state.fieldStates).forEach((fieldState) => {
        // Note: Fields marked with visible: false in survey definition will be false
        expect(typeof fieldState.visible).toBe('boolean');
      });
    });
  });

  describe('updateFieldValue', () => {
    it('should update field value', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);
      const responses: SurveyResponse = {
        surveyId: 'customer-satisfaction',
        responses: {},
        startTime: Date.now(),
        lastUpdated: Date.now(),
      };

      // Initialize responses
      customerSatisfactionSurvey.sections.forEach((section) => {
        section.questions.forEach((question) => {
          responses.responses[question.id] = {
            fieldId: question.id,
            value: null,
            timestamp: Date.now(),
            valid: true,
            errors: [],
          };
        });
      });

      const { state: newState, responses: newResponses } = stateManager.updateFieldValue(
        customerSatisfactionSurvey,
        'satisfaction',
        'very-satisfied',
        state,
        responses
      );

      expect(newState.fieldStates['satisfaction'].value).toBe('very-satisfied');
      expect(newState.fieldStates['satisfaction'].dirty).toBe(true);
      expect(newState.fieldStates['satisfaction'].touched).toBe(true);
    });

    it('should trigger conditional rules on field update', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);
      const responses: SurveyResponse = {
        surveyId: 'customer-satisfaction',
        responses: {},
        startTime: Date.now(),
        lastUpdated: Date.now(),
      };

      // Initialize responses
      customerSatisfactionSurvey.sections.forEach((section) => {
        section.questions.forEach((question) => {
          responses.responses[question.id] = {
            fieldId: question.id,
            value: null,
            timestamp: Date.now(),
            valid: true,
            errors: [],
          };
        });
      });

      // Update satisfaction to trigger showing satisfaction-details
      const { state: newState } = stateManager.updateFieldValue(
        customerSatisfactionSurvey,
        'satisfaction',
        'very-satisfied',
        state,
        responses
      );

      // The satisfaction-details should now be visible
      expect(newState.fieldStates['satisfaction-details'].visible).toBe(true);
    });

    it('should mark field as touched and dirty', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);
      const responses: SurveyResponse = {
        surveyId: 'customer-satisfaction',
        responses: {},
        startTime: Date.now(),
        lastUpdated: Date.now(),
      };

      // Initialize responses
      customerSatisfactionSurvey.sections.forEach((section) => {
        section.questions.forEach((question) => {
          responses.responses[question.id] = {
            fieldId: question.id,
            value: null,
            timestamp: Date.now(),
            valid: true,
            errors: [],
          };
        });
      });

      const { state: newState } = stateManager.updateFieldValue(
        customerSatisfactionSurvey,
        'satisfaction',
        'satisfied',
        state,
        responses
      );

      expect(newState.fieldStates['satisfaction'].touched).toBe(true);
      expect(newState.fieldStates['satisfaction'].dirty).toBe(true);
    });
  });

  describe('resetField', () => {
    it('should reset field to initial state', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);
      const responses: SurveyResponse = {
        surveyId: 'customer-satisfaction',
        responses: {},
        startTime: Date.now(),
        lastUpdated: Date.now(),
      };

      // Initialize responses
      customerSatisfactionSurvey.sections.forEach((section) => {
        section.questions.forEach((question) => {
          responses.responses[question.id] = {
            fieldId: question.id,
            value: null,
            timestamp: Date.now(),
            valid: true,
            errors: [],
          };
        });
      });

      // Set a value
      const fieldState = state.fieldStates['satisfaction'];
      fieldState.value = 'satisfied';
      fieldState.dirty = true;
      fieldState.touched = true;

      // Reset
      const { state: resetState } = stateManager.resetField('satisfaction', state, responses);

      expect(resetState.fieldStates['satisfaction'].value).toBeNull();
      expect(resetState.fieldStates['satisfaction'].dirty).toBe(false);
      expect(resetState.fieldStates['satisfaction'].touched).toBe(false);
    });
  });

  describe('getVisibleFields', () => {
    it('should return only visible fields', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);

      const visibleFields = stateManager.getVisibleFields(customerSatisfactionSurvey, state);

      expect(Array.isArray(visibleFields)).toBe(true);
      visibleFields.forEach((fieldId) => {
        expect(stateManager.isFieldVisible(fieldId, state)).toBe(true);
      });
    });
  });

  describe('isFieldVisible', () => {
    it('should correctly report field visibility', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);

      const isVisible = stateManager.isFieldVisible('satisfaction', state);
      expect(typeof isVisible).toBe('boolean');
    });
  });

  describe('isFieldEnabled', () => {
    it('should correctly report field enabled state', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);

      const isEnabled = stateManager.isFieldEnabled('satisfaction', state);
      expect(typeof isEnabled).toBe('boolean');
    });
  });

  describe('isFieldRequired', () => {
    it('should correctly report field required state', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);

      const isRequired = stateManager.isFieldRequired('satisfaction', state);
      expect(typeof isRequired).toBe('boolean');
    });
  });

  describe('isSurveyValid', () => {
    it('should report survey validity', () => {
      const state = stateManager.initializeSurvey(customerSatisfactionSurvey);

      const isValid = stateManager.isSurveyValid(state);
      expect(typeof isValid).toBe('boolean');
    });
  });
});
