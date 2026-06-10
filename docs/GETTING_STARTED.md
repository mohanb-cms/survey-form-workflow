# Getting Started with Dynamic Survey Form Workflow

This guide will help you get started with the Survey Form Workflow system and create your first dynamic survey.

## Installation

```bash
npm install
npm run build
```

## Basic Usage

### 1. Creating a Simple Survey

```typescript
import { Survey, Condition } from './types';

const simpleSurvey: Survey = {
  id: 'my-survey',
  title: 'My First Survey',
  description: 'A simple survey with conditional logic',
  version: '1.0.0',
  sections: [
    {
      id: 'section-1',
      title: 'Basic Information',
      questions: [
        {
          id: 'age-group',
          type: 'radio',
          label: 'What is your age group?',
          required: true,
          options: [
            { id: '1', label: '18-25', value: 'young' },
            { id: '2', label: '26-40', value: 'adult' },
            { id: '3', label: '40+', value: 'senior' },
          ],
        },
      ],
    },
  ],
};
```

### 2. Using the Survey Form Component

```typescript
import React, { useState } from 'react';
import { SurveyForm } from './components/SurveyForm';
import { SurveyResponse } from './types';

function App() {
  const handleSubmit = (responses: SurveyResponse) => {
    console.log('Survey submitted:', responses);
  };

  return (
    <SurveyForm 
      survey={simpleSurvey} 
      onSubmit={handleSubmit}
    />
  );
}
```

### 3. Managing Survey State

```typescript
import { SurveyStateManager } from './state/stateManager';

const stateManager = new SurveyStateManager();

// Initialize survey state
const state = stateManager.initializeSurvey(simpleSurvey);

// Create initial responses object
const responses: SurveyResponse = {
  surveyId: simpleSurvey.id,
  responses: {},
  startTime: Date.now(),
  lastUpdated: Date.now(),
};

// Update field value
const { state: newState, responses: newResponses } = stateManager.updateFieldValue(
  simpleSurvey,
  'age-group',
  'adult',
  state,
  responses
);
```

## Advanced: Conditional Logic

### Understanding Conditions

There are two types of conditions:

#### Simple Condition
```typescript
const simpleCondition: Condition = {
  fieldId: 'age-group',
  operator: 'equals',
  value: 'adult',
};
```

#### Complex Condition
```typescript
const complexCondition: ComplexCondition = {
  operator: 'AND',
  conditions: [
    {
      fieldId: 'age-group',
      operator: 'in',
      value: ['adult', 'senior'],
    } as Condition,
    {
      fieldId: 'years-employed',
      operator: 'greaterThanOrEqual',
      value: 5,
    } as Condition,
  ],
};
```

### Available Operators

#### Comparison Operators
- `equals` - Exact match
- `notEquals` - Not equal
- `greaterThan` - Numeric greater than
- `lessThan` - Numeric less than
- `greaterThanOrEqual` - Numeric ≥
- `lessThanOrEqual` - Numeric ≤
- `contains` - String contains
- `notContains` - String doesn't contain
- `startsWith` - String starts with
- `endsWith` - String ends with
- `in` - Value in array
- `notIn` - Value not in array
- `isEmpty` - Field is empty/null
- `isNotEmpty` - Field is not empty

#### Logical Operators
- `AND` - All conditions must be true
- `OR` - At least one condition must be true
- `NOT` - Negates the condition

### Setting Up Conditional Rules

```typescript
const questionWithRules: TextQuestion = {
  id: 'job-title',
  type: 'text',
  label: 'What is your job title?',
  required: true,
  rules: [
    {
      id: 'rule-show-job-title',
      condition: {
        fieldId: 'age-group',
        operator: 'in',
        value: ['adult', 'senior'],
      } as Condition,
      actions: [
        { action: 'show', targetFieldId: 'job-title' },
        { action: 'require', targetFieldId: 'job-title' },
      ],
      priority: 10,
    },
  ],
  visible: false, // Initially hidden
};
```

### Available Actions

- `show` - Make field visible
- `hide` - Hide field
- `enable` - Enable field for input
- `disable` - Disable field (read-only)
- `require` - Make field required
- `unrequire` - Make field optional
- `clear` - Clear field value

## Question Types

### Text Input
```typescript
{
  type: 'text',
  minLength: 2,
  maxLength: 100,
  pattern: '^[a-zA-Z\\s]*$',
}
```

### Number Input
```typescript
{
  type: 'number',
  min: 0,
  max: 150,
  step: 1,
}
```

### Email
```typescript
{
  type: 'email',
}
```

### Textarea
```typescript
{
  type: 'textarea',
  minLength: 10,
  maxLength: 1000,
  rows: 6,
}
```

### Select Dropdown
```typescript
{
  type: 'select',
  options: [
    { id: '1', label: 'Option 1', value: 'opt1' },
    { id: '2', label: 'Option 2', value: 'opt2' },
  ],
}
```

### Multi-Select
```typescript
{
  type: 'multiselect',
  multiple: true,
  minSelected: 1,
  maxSelected: 3,
  options: [...],
}
```

### Radio Buttons
```typescript
{
  type: 'radio',
  options: [
    { id: '1', label: 'Yes', value: true },
    { id: '2', label: 'No', value: false },
  ],
}
```

### Checkbox
```typescript
{
  type: 'checkbox',
  // Single checkbox
}
```

### Date
```typescript
{
  type: 'date',
  minDate: '2020-01-01',
  maxDate: '2025-12-31',
}
```

### Range Slider
```typescript
{
  type: 'range',
  min: 1,
  max: 10,
  step: 1,
  labels: {
    '1': 'Very Poor',
    '10': 'Excellent',
  },
}
```

## Validation

The system includes built-in validators for all field types. Custom validators can be registered:

```typescript
import { getValidatorRegistry, validateField } from './validators/fieldValidator';

// Validate a field
const result = validateField(questionField, userInput);
if (!result.valid) {
  console.log('Validation errors:', result.errors);
}

// Register custom validator
const registry = getValidatorRegistry();
registry.register('custom-validator', (context) => {
  if (context.value && context.value.length < 3) {
    return {
      valid: false,
      errors: ['Value must be at least 3 characters'],
    };
  }
  return { valid: true, errors: [] };
});
```

## Examples

Check out the `/src/examples/surveys.ts` file for complete survey examples:

- **Customer Satisfaction Survey** - Shows/hides follow-up questions based on satisfaction level
- **Employee Benefits Survey** - Complex nested conditions for multi-step questionnaire
- **Product Feedback Survey** - Demonstrates range sliders and conditional dependencies

## Testing

Run the test suite:

```bash
npm run test
npm run test:watch
```

Tests cover:
- Condition evaluation (simple and complex)
- State management and field updates
- Conditional rule application
- Validation logic

## Performance Considerations

1. **Rule Evaluation**: Rules are evaluated on every field update. For surveys with many rules, consider using rule priorities to optimize evaluation order.

2. **Dependency Tracking**: The system tracks field dependencies to minimize unnecessary re-evaluations.

3. **History Management**: Response history is limited to 50 entries by default. Adjust `maxHistorySize` in `SurveyStateManager` if needed.

## Debugging

Use the `ConditionalLogicVisualizer` component to inspect the state during development:

```typescript
import { ConditionalLogicVisualizer } from './components/ConditionalLogicVisualizer';

<ConditionalLogicVisualizer state={state} stateManager={stateManager} />
```

This will display:
- Active evaluated rules
- Current field states (visible, enabled, required, etc.)
- Field values and validation errors
- Survey info (valid, submitting, etc.)

## Next Steps

- Read the [API Reference](./API.md)
- Check [Advanced Patterns](./ADVANCED_PATTERNS.md)
- Review the [Examples](../src/examples/)
