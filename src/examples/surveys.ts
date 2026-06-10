/**
 * Example surveys demonstrating conditional logic
 */

import { Survey, Condition, ComplexCondition, ConditionalRule } from '../types';

/**
 * Example 1: Customer Satisfaction Survey with nested conditionals
 */
export const customerSatisfactionSurvey: Survey = {
  id: 'customer-satisfaction',
  title: 'Customer Satisfaction Survey',
  description: 'Help us improve by sharing your feedback',
  version: '1.0.0',
  sections: [
    {
      id: 'section-1',
      title: 'Overall Experience',
      questions: [
        {
          id: 'satisfaction',
          type: 'radio',
          label: 'How satisfied are you with our service?',
          required: true,
          options: [
            { id: 'opt-1', label: 'Very Satisfied', value: 'very-satisfied' },
            { id: 'opt-2', label: 'Satisfied', value: 'satisfied' },
            { id: 'opt-3', label: 'Neutral', value: 'neutral' },
            { id: 'opt-4', label: 'Dissatisfied', value: 'dissatisfied' },
            { id: 'opt-5', label: 'Very Dissatisfied', value: 'very-dissatisfied' },
          ],
          rules: [],
        },
        {
          id: 'satisfaction-details',
          type: 'textarea',
          label: 'Please tell us why you are satisfied',
          required: true,
          rules: [
            {
              id: 'rule-show-satisfied',
              condition: {
                fieldId: 'satisfaction',
                operator: 'in',
                value: ['very-satisfied', 'satisfied'],
              } as Condition,
              actions: [
                { action: 'show', targetFieldId: 'satisfaction-details' },
                { action: 'enable', targetFieldId: 'satisfaction-details' },
              ],
              priority: 10,
            },
          ],
          visible: false,
          disabled: true,
        },
        {
          id: 'issues',
          type: 'multiselect',
          label: 'What issues did you experience?',
          required: true,
          multiple: true,
          options: [
            { id: 'opt-1', label: 'Product Quality', value: 'quality' },
            { id: 'opt-2', label: 'Customer Service', value: 'service' },
            { id: 'opt-3', label: 'Delivery Speed', value: 'delivery' },
            { id: 'opt-4', label: 'Pricing', value: 'pricing' },
            { id: 'opt-5', label: 'Other', value: 'other' },
          ],
          rules: [
            {
              id: 'rule-show-issues',
              condition: {
                fieldId: 'satisfaction',
                operator: 'in',
                value: ['dissatisfied', 'very-dissatisfied', 'neutral'],
              } as Condition,
              actions: [
                { action: 'show', targetFieldId: 'issues' },
                { action: 'enable', targetFieldId: 'issues' },
                { action: 'require', targetFieldId: 'issues' },
              ],
              priority: 10,
            },
          ],
          visible: false,
          disabled: true,
        },
        {
          id: 'other-issues',
          type: 'textarea',
          label: 'Please describe other issues',
          required: true,
          rules: [
            {
              id: 'rule-show-other-issues',
              condition: {
                operator: 'AND',
                conditions: [
                  {
                    fieldId: 'issues',
                    operator: 'contains',
                    value: 'other',
                  } as Condition,
                ],
              } as ComplexCondition,
              actions: [
                { action: 'show', targetFieldId: 'other-issues' },
                { action: 'enable', targetFieldId: 'other-issues' },
                { action: 'require', targetFieldId: 'other-issues' },
              ],
              priority: 15,
            },
          ],
          visible: false,
          disabled: true,
        },
      ],
    },
    {
      id: 'section-2',
      title: 'Follow-up',
      questions: [
        {
          id: 'contact-follow-up',
          type: 'checkbox',
          label: 'May we contact you for follow-up?',
          rules: [],
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          rules: [
            {
              id: 'rule-require-email',
              condition: {
                fieldId: 'contact-follow-up',
                operator: 'equals',
                value: true,
              } as Condition,
              actions: [
                { action: 'show', targetFieldId: 'email' },
                { action: 'require', targetFieldId: 'email' },
              ],
              priority: 10,
            },
          ],
          visible: false,
        },
      ],
    },
  ],
};

/**
 * Example 2: Employee Benefits Survey with complex conditional logic
 */
export const employeeBenefitsSurvey: Survey = {
  id: 'employee-benefits',
  title: 'Employee Benefits Questionnaire',
  description: 'Please answer questions based on your employment status',
  version: '1.0.0',
  sections: [
    {
      id: 'employment-info',
      title: 'Employment Information',
      questions: [
        {
          id: 'employment-type',
          type: 'radio',
          label: 'What is your employment type?',
          required: true,
          options: [
            { id: 'opt-1', label: 'Full-time', value: 'full-time' },
            { id: 'opt-2', label: 'Part-time', value: 'part-time' },
            { id: 'opt-3', label: 'Contractor', value: 'contractor' },
            { id: 'opt-4', label: 'Temporary', value: 'temporary' },
          ],
          rules: [],
        },
        {
          id: 'years-employed',
          type: 'number',
          label: 'How many years have you been employed?',
          required: true,
          min: 0,
          max: 60,
          rules: [
            {
              id: 'rule-show-years',
              condition: {
                fieldId: 'employment-type',
                operator: 'in',
                value: ['full-time', 'part-time'],
              } as Condition,
              actions: [
                { action: 'show', targetFieldId: 'years-employed' },
                { action: 'enable', targetFieldId: 'years-employed' },
              ],
              priority: 10,
            },
          ],
          visible: false,
          disabled: true,
        },
      ],
    },
    {
      id: 'benefits-selection',
      title: 'Benefits Selection',
      questions: [
        {
          id: 'health-insurance',
          type: 'radio',
          label: 'Do you want health insurance coverage?',
          required: true,
          options: [
            { id: 'opt-1', label: 'Yes', value: true },
            { id: 'opt-2', label: 'No', value: false },
          ],
          rules: [
            {
              id: 'rule-show-health-insurance',
              condition: {
                fieldId: 'employment-type',
                operator: 'equals',
                value: 'full-time',
              } as Condition,
              actions: [
                { action: 'show', targetFieldId: 'health-insurance' },
                { action: 'require', targetFieldId: 'health-insurance' },
              ],
              priority: 10,
            },
          ],
          visible: false,
        },
        {
          id: 'insurance-plan',
          type: 'select',
          label: 'Select your insurance plan',
          required: true,
          options: [
            { id: 'opt-1', label: 'Basic Plan', value: 'basic' },
            { id: 'opt-2', label: 'Standard Plan', value: 'standard' },
            { id: 'opt-3', label: 'Premium Plan', value: 'premium' },
          ],
          rules: [
            {
              id: 'rule-show-insurance-plan',
              condition: {
                operator: 'AND',
                conditions: [
                  {
                    fieldId: 'employment-type',
                    operator: 'equals',
                    value: 'full-time',
                  } as Condition,
                  {
                    fieldId: 'health-insurance',
                    operator: 'equals',
                    value: true,
                  } as Condition,
                ],
              } as ComplexCondition,
              actions: [
                { action: 'show', targetFieldId: 'insurance-plan' },
                { action: 'require', targetFieldId: 'insurance-plan' },
              ],
              priority: 15,
            },
          ],
          visible: false,
          disabled: true,
        },
        {
          id: 'retirement-plan',
          type: 'radio',
          label: 'Do you want to enroll in the retirement plan?',
          required: true,
          options: [
            { id: 'opt-1', label: 'Yes', value: true },
            { id: 'opt-2', label: 'No', value: false },
          ],
          rules: [
            {
              id: 'rule-show-retirement',
              condition: {
                operator: 'AND',
                conditions: [
                  {
                    fieldId: 'employment-type',
                    operator: 'in',
                    value: ['full-time', 'part-time'],
                  } as Condition,
                  {
                    fieldId: 'years-employed',
                    operator: 'greaterThanOrEqual',
                    value: 1,
                  } as Condition,
                ],
              } as ComplexCondition,
              actions: [
                { action: 'show', targetFieldId: 'retirement-plan' },
                { action: 'require', targetFieldId: 'retirement-plan' },
              ],
              priority: 15,
            },
          ],
          visible: false,
          disabled: true,
        },
        {
          id: 'retirement-contribution',
          type: 'number',
          label: 'What percentage of salary would you like to contribute? (0-10%)',
          required: true,
          min: 0,
          max: 10,
          rules: [
            {
              id: 'rule-show-retirement-contribution',
              condition: {
                operator: 'AND',
                conditions: [
                  {
                    fieldId: 'retirement-plan',
                    operator: 'equals',
                    value: true,
                  } as Condition,
                ],
              } as ComplexCondition,
              actions: [
                { action: 'show', targetFieldId: 'retirement-contribution' },
                { action: 'require', targetFieldId: 'retirement-contribution' },
              ],
              priority: 20,
            },
          ],
          visible: false,
          disabled: true,
        },
      ],
    },
  ],
};

/**
 * Example 3: Product Feedback Survey with nested NOT operators
 */
export const productFeedbackSurvey: Survey = {
  id: 'product-feedback',
  title: 'Product Feedback Survey',
  description: 'Share your experience with our product',
  version: '1.0.0',
  sections: [
    {
      id: 'section-usage',
      title: 'Product Usage',
      questions: [
        {
          id: 'uses-product',
          type: 'radio',
          label: 'Do you actively use our product?',
          required: true,
          options: [
            { id: 'opt-1', label: 'Daily', value: 'daily' },
            { id: 'opt-2', label: 'Weekly', value: 'weekly' },
            { id: 'opt-3', label: 'Monthly', value: 'monthly' },
            { id: 'opt-4', label: 'Never', value: 'never' },
          ],
          rules: [],
        },
        {
          id: 'inactive-reason',
          type: 'textarea',
          label: 'Why do you not use our product?',
          required: true,
          rules: [
            {
              id: 'rule-show-inactive-reason',
              condition: {
                fieldId: 'uses-product',
                operator: 'equals',
                value: 'never',
              } as Condition,
              actions: [
                { action: 'show', targetFieldId: 'inactive-reason' },
                { action: 'require', targetFieldId: 'inactive-reason' },
              ],
              priority: 10,
            },
          ],
          visible: false,
          disabled: true,
        },
      ],
    },
    {
      id: 'section-feedback',
      title: 'Your Feedback',
      questions: [
        {
          id: 'features-rating',
          type: 'range',
          label: 'Rate the quality of features (1-5)',
          required: true,
          min: 1,
          max: 5,
          rules: [
            {
              id: 'rule-show-features',
              condition: {
                fieldId: 'uses-product',
                operator: 'notEquals',
                value: 'never',
              } as Condition,
              actions: [
                { action: 'show', targetFieldId: 'features-rating' },
                { action: 'require', targetFieldId: 'features-rating' },
              ],
              priority: 10,
            },
          ],
          visible: false,
          disabled: true,
        },
        {
          id: 'features-feedback',
          type: 'textarea',
          label: 'What features would you like to see?',
          required: true,
          rules: [
            {
              id: 'rule-show-features-feedback',
              condition: {
                operator: 'AND',
                conditions: [
                  {
                    fieldId: 'uses-product',
                    operator: 'notEquals',
                    value: 'never',
                  } as Condition,
                  {
                    fieldId: 'features-rating',
                    operator: 'lessThanOrEqual',
                    value: 3,
                  } as Condition,
                ],
              } as ComplexCondition,
              actions: [
                { action: 'show', targetFieldId: 'features-feedback' },
                { action: 'require', targetFieldId: 'features-feedback' },
              ],
              priority: 15,
            },
          ],
          visible: false,
          disabled: true,
        },
      ],
    },
  ],
};
