import React, { useState, useEffect } from 'react';
import { Survey, SurveyState, SurveyResponse, Question } from '../types';
import { SurveyStateManager } from '../state/stateManager';

interface SurveyFormProps {
  survey: Survey;
  onSubmit?: (responses: SurveyResponse) => void;
  onResponseChange?: (responses: SurveyResponse) => void;
  initialResponses?: SurveyResponse;
}

/**
 * Main survey form component with conditional logic support
 */
export const SurveyForm: React.FC<SurveyFormProps> = ({
  survey,
  onSubmit,
  onResponseChange,
  initialResponses,
}) => {
  const [state, setState] = useState<SurveyState>(() => {
    const stateManager = new SurveyStateManager();
    return stateManager.initializeSurvey(survey);
  });

  const [responses, setResponses] = useState<SurveyResponse>(() => {
    if (initialResponses) return initialResponses;

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

    return newResponses;
  });

  const stateManager = new SurveyStateManager();

  /**
   * Handles field value change
   */
  const handleFieldChange = (fieldId: string, value: any) => {
    const { state: newState, responses: newResponses } = stateManager.updateFieldValue(
      survey,
      fieldId,
      value,
      state,
      responses
    );

    setState(newState);
    setResponses(newResponses);

    if (onResponseChange) {
      onResponseChange(newResponses);
    }
  };

  /**
   * Handles form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!stateManager.isSurveyValid(state)) {
      alert('Please fix errors before submitting');
      return;
    }

    const submittedResponses = {
      ...responses,
      submitted: true,
      submittedAt: Date.now(),
    };

    if (onSubmit) {
      onSubmit(submittedResponses);
    }
  };

  /**
   * Handles form reset
   */
  const handleReset = () => {
    const { state: newState, responses: newResponses } = stateManager.resetSurvey(survey, state, responses);
    setState(newState);
    setResponses(newResponses);
  };

  return (
    <form onSubmit={handleSubmit} className="survey-form">
      <div className="survey-header">
        <h1>{survey.title}</h1>
        {survey.description && <p className="description">{survey.description}</p>}
      </div>

      <div className="survey-sections">
        {survey.sections.map((section) => (
          <section
            key={section.id}
            className={`survey-section ${!stateManager.isFieldVisible(section.id, state) ? 'hidden' : ''}`}
          >
            <h2>{section.title}</h2>
            {section.description && <p className="section-description">{section.description}</p>}

            <div className="questions">
              {section.questions.map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  value={stateManager.getFieldValue(question.id, state)}
                  visible={stateManager.isFieldVisible(question.id, state)}
                  enabled={stateManager.isFieldEnabled(question.id, state)}
                  required={stateManager.isFieldRequired(question.id, state)}
                  errors={stateManager.getFieldErrors(question.id, state)}
                  onChange={(value) => handleFieldChange(question.id, value)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="survey-actions">
        <button type="submit" className="btn btn-primary" disabled={stateManager.isFieldVisible('', state) === false}>
          Submit
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  );
};

interface QuestionFieldProps {
  question: Question;
  value: any;
  visible: boolean;
  enabled: boolean;
  required: boolean;
  errors: string[];
  onChange: (value: any) => void;
}

/**
 * Individual question field component
 */
const QuestionField: React.FC<QuestionFieldProps> = ({
  question,
  value,
  visible,
  enabled,
  required,
  errors,
  onChange,
}) => {
  if (!visible) {
    return null;
  }

  const fieldClassName = `form-field ${errors.length > 0 ? 'error' : ''} ${!enabled ? 'disabled' : ''}`;
  const requiredIndicator = required ? <span className="required">*</span> : null;

  return (
    <div className={fieldClassName}>
      <label htmlFor={question.id}>
        {question.label}
        {requiredIndicator}
      </label>

      {question.description && <p className="field-description">{question.description}</p>}

      <FieldRenderer question={question} value={value} enabled={enabled} onChange={onChange} />

      {question.helpText && <p className="help-text">{question.helpText}</p>}

      {errors.length > 0 && (
        <div className="field-errors">
          {errors.map((error, index) => (
            <p key={index} className="error-message">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

interface FieldRendererProps {
  question: Question;
  value: any;
  enabled: boolean;
  onChange: (value: any) => void;
}

/**
 * Renders appropriate input component based on question type
 */
const FieldRenderer: React.FC<FieldRendererProps> = ({ question, value, enabled, onChange }) => {
  switch (question.type) {
    case 'text':
      return (
        <input
          id={question.id}
          type="text"
          value={value || ''}
          disabled={!enabled}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
          minLength={(question as any).minLength}
          maxLength={(question as any).maxLength}
        />
      );

    case 'number':
      return (
        <input
          id={question.id}
          type="number"
          value={value || ''}
          disabled={!enabled}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          min={(question as any).min}
          max={(question as any).max}
          step={(question as any).step}
        />
      );

    case 'email':
      return (
        <input
          id={question.id}
          type="email"
          value={value || ''}
          disabled={!enabled}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'textarea':
      return (
        <textarea
          id={question.id}
          value={value || ''}
          disabled={!enabled}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={(question as any).rows || 4}
          minLength={(question as any).minLength}
          maxLength={(question as any).maxLength}
        />
      );

    case 'select':
      const selectQ = question as any;
      return (
        <select
          id={question.id}
          value={value || ''}
          disabled={!enabled}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">Select an option</option>
          {selectQ.options.map((opt: any) => (
            <option key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'multiselect':
      const multiQ = question as any;
      return (
        <select
          id={question.id}
          multiple
          value={value || []}
          disabled={!enabled}
          onChange={(e) => onChange(Array.from(e.target.selectedOptions).map((opt) => opt.value))}
        >
          {multiQ.options.map((opt: any) => (
            <option key={opt.id} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'radio':
      const radioQ = question as any;
      return (
        <fieldset id={question.id}>
          {radioQ.options.map((opt: any) => (
            <label key={opt.id}>
              <input
                type="radio"
                name={question.id}
                value={opt.value}
                checked={value === opt.value}
                disabled={!enabled}
                onChange={(e) => onChange(e.target.value)}
              />
              {opt.label}
            </label>
          ))}
        </fieldset>
      );

    case 'checkbox':
      const checkboxQ = question as any;
      if (checkboxQ.options && checkboxQ.options.length > 0) {
        return (
          <fieldset id={question.id}>
            {checkboxQ.options.map((opt: any) => (
              <label key={opt.id}>
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={(value || []).includes(opt.value)}
                  disabled={!enabled}
                  onChange={(e) => {
                    const newValue = value || [];
                    if (e.target.checked) {
                      onChange([...newValue, opt.value]);
                    } else {
                      onChange(newValue.filter((v: any) => v !== opt.value));
                    }
                  }}
                />
                {opt.label}
              </label>
            ))}
          </fieldset>
        );
      } else {
        return (
          <input
            id={question.id}
            type="checkbox"
            checked={value || false}
            disabled={!enabled}
            onChange={(e) => onChange(e.target.checked)}
          />
        );
      }

    case 'date':
      return (
        <input
          id={question.id}
          type="date"
          value={value || ''}
          disabled={!enabled}
          onChange={(e) => onChange(e.target.value || null)}
          min={(question as any).minDate}
          max={(question as any).maxDate}
        />
      );

    case 'time':
      return (
        <input
          id={question.id}
          type="time"
          value={value || ''}
          disabled={!enabled}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );

    case 'range':
      const rangeQ = question as any;
      return (
        <input
          id={question.id}
          type="range"
          min={rangeQ.min}
          max={rangeQ.max}
          step={rangeQ.step || 1}
          value={value || rangeQ.min}
          disabled={!enabled}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );

    default:
      return null;
  }
};

export default SurveyForm;
