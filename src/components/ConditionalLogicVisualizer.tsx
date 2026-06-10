import React, { useState } from 'react';
import { SurveyState } from '../types';
import { SurveyStateManager } from '../state/stateManager';

interface ConditionalLogicVisualizerProps {
  state: SurveyState;
  stateManager: SurveyStateManager;
}

/**
 * Component to visualize active conditional rules and field states
 */
export const ConditionalLogicVisualizer: React.FC<ConditionalLogicVisualizerProps> = ({
  state,
  stateManager,
}) => {
  const [expandedField, setExpandedField] = useState<string | null>(null);

  return (
    <div className="conditional-logic-visualizer">
      <h3>Conditional Logic State</h3>

      <div className="visualizer-content">
        <div className="active-rules">
          <h4>Active Rules</h4>
          <p>Total rules evaluated: {state.evaluatedRules.size}</p>
          <ul>
            {Array.from(state.evaluatedRules).map((ruleId) => (
              <li key={ruleId} className="active-rule">
                {ruleId}
              </li>
            ))}
          </ul>
        </div>

        <div className="field-states">
          <h4>Field States</h4>
          <div className="field-state-list">
            {Object.entries(state.fieldStates).map(([fieldId, fieldState]) => (
              <div key={fieldId} className="field-state-item">
                <div
                  className="field-state-header"
                  onClick={() =>
                    setExpandedField(expandedField === fieldId ? null : fieldId)
                  }
                >
                  <span className="field-id">{fieldId}</span>
                  <div className="field-status-badges">
                    {fieldState.visible ? (
                      <span className="badge badge-visible">Visible</span>
                    ) : (
                      <span className="badge badge-hidden">Hidden</span>
                    )}
                    {fieldState.enabled ? (
                      <span className="badge badge-enabled">Enabled</span>
                    ) : (
                      <span className="badge badge-disabled">Disabled</span>
                    )}
                    {fieldState.required ? (
                      <span className="badge badge-required">Required</span>
                    ) : null}
                    {fieldState.dirty ? (
                      <span className="badge badge-dirty">Dirty</span>
                    ) : null}
                    {fieldState.touched ? (
                      <span className="badge badge-touched">Touched</span>
                    ) : null}
                  </div>
                </div>

                {expandedField === fieldId && (
                  <div className="field-state-details">
                    <p>
                      <strong>Value:</strong> {JSON.stringify(fieldState.value)}
                    </p>
                    <p>
                      <strong>Errors:</strong>{' '}
                      {fieldState.errors.length > 0
                        ? fieldState.errors.join(', ')
                        : 'None'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="survey-info">
          <h4>Survey Info</h4>
          <p>
            <strong>Survey ID:</strong> {state.surveyId}
          </p>
          <p>
            <strong>Valid:</strong> {state.isValid ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Submitting:</strong> {state.isSubmitting ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Last Evaluated:</strong>{' '}
            {new Date(state.lastEvaluated).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <style>{`
        .conditional-logic-visualizer {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 16px;
          margin-top: 16px;
          background-color: #f9f9f9;
        }

        .conditional-logic-visualizer h3 {
          margin-top: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .visualizer-content {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 16px;
          margin-top: 16px;
        }

        .visualizer-content > div {
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 12px;
          background-color: white;
        }

        .visualizer-content h4 {
          margin-top: 0;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 8px;
        }

        .active-rule {
          list-style: none;
          padding: 4px 0;
          font-size: 12px;
          color: #555;
        }

        .field-state-item {
          margin-bottom: 8px;
          border: 1px solid #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
        }

        .field-state-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background-color: #f5f5f5;
          cursor: pointer;
          user-select: none;
        }

        .field-state-header:hover {
          background-color: #efefef;
        }

        .field-id {
          font-weight: 500;
          font-size: 12px;
        }

        .field-status-badges {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 500;
        }

        .badge-visible {
          background-color: #d4edda;
          color: #155724;
        }

        .badge-hidden {
          background-color: #f8d7da;
          color: #721c24;
        }

        .badge-enabled {
          background-color: #d1ecf1;
          color: #0c5460;
        }

        .badge-disabled {
          background-color: #e2e3e5;
          color: #383d41;
        }

        .badge-required {
          background-color: #fff3cd;
          color: #856404;
        }

        .badge-dirty {
          background-color: #e7d4f5;
          color: #663399;
        }

        .badge-touched {
          background-color: #d5e8f7;
          color: #004085;
        }

        .field-state-details {
          padding: 8px;
          border-top: 1px solid #e0e0e0;
          background-color: #fafafa;
          font-size: 12px;
        }

        .field-state-details p {
          margin: 4px 0;
          word-break: break-all;
        }

        .survey-info p {
          margin: 6px 0;
          font-size: 12px;
        }

        @media (max-width: 1200px) {
          .visualizer-content {
            grid-template-columns: 1fr 1fr;
          }

          .survey-info {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .visualizer-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ConditionalLogicVisualizer;
