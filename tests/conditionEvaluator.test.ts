import { evaluateCondition, evaluateComplexCondition, isConditionMet, getConditionDependencies } from '../src/engine/conditionEvaluator';
import { Condition, ComplexCondition } from '../src/types';

describe('Condition Evaluator', () => {
  describe('evaluateCondition', () => {
    it('should evaluate equals operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'equals',
        value: 'hello',
      };

      expect(evaluateCondition(condition, 'hello')).toBe(true);
      expect(evaluateCondition(condition, 'world')).toBe(false);
    });

    it('should evaluate notEquals operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'notEquals',
        value: 'hello',
      };

      expect(evaluateCondition(condition, 'world')).toBe(true);
      expect(evaluateCondition(condition, 'hello')).toBe(false);
    });

    it('should evaluate greaterThan operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'greaterThan',
        value: 10,
      };

      expect(evaluateCondition(condition, 15)).toBe(true);
      expect(evaluateCondition(condition, 5)).toBe(false);
      expect(evaluateCondition(condition, 10)).toBe(false);
    });

    it('should evaluate lessThan operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'lessThan',
        value: 10,
      };

      expect(evaluateCondition(condition, 5)).toBe(true);
      expect(evaluateCondition(condition, 15)).toBe(false);
      expect(evaluateCondition(condition, 10)).toBe(false);
    });

    it('should evaluate greaterThanOrEqual operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'greaterThanOrEqual',
        value: 10,
      };

      expect(evaluateCondition(condition, 15)).toBe(true);
      expect(evaluateCondition(condition, 10)).toBe(true);
      expect(evaluateCondition(condition, 5)).toBe(false);
    });

    it('should evaluate lessThanOrEqual operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'lessThanOrEqual',
        value: 10,
      };

      expect(evaluateCondition(condition, 5)).toBe(true);
      expect(evaluateCondition(condition, 10)).toBe(true);
      expect(evaluateCondition(condition, 15)).toBe(false);
    });

    it('should evaluate contains operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'contains',
        value: 'world',
      };

      expect(evaluateCondition(condition, 'hello world')).toBe(true);
      expect(evaluateCondition(condition, 'hello')).toBe(false);
    });

    it('should evaluate notContains operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'notContains',
        value: 'world',
      };

      expect(evaluateCondition(condition, 'hello')).toBe(true);
      expect(evaluateCondition(condition, 'hello world')).toBe(false);
    });

    it('should evaluate in operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'in',
        value: ['a', 'b', 'c'],
      };

      expect(evaluateCondition(condition, 'a')).toBe(true);
      expect(evaluateCondition(condition, 'd')).toBe(false);
    });

    it('should evaluate isEmpty operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'isEmpty',
        value: null,
      };

      expect(evaluateCondition(condition, null)).toBe(true);
      expect(evaluateCondition(condition, '')).toBe(true);
      expect(evaluateCondition(condition, [])).toBe(true);
      expect(evaluateCondition(condition, 'hello')).toBe(false);
    });

    it('should evaluate isNotEmpty operator', () => {
      const condition: Condition = {
        fieldId: 'test',
        operator: 'isNotEmpty',
        value: null,
      };

      expect(evaluateCondition(condition, 'hello')).toBe(true);
      expect(evaluateCondition(condition, null)).toBe(false);
      expect(evaluateCondition(condition, '')).toBe(false);
    });
  });

  describe('evaluateComplexCondition', () => {
    it('should evaluate AND operator with all true conditions', () => {
      const condition: ComplexCondition = {
        operator: 'AND',
        conditions: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'yes',
          } as Condition,
          {
            fieldId: 'field2',
            operator: 'greaterThan',
            value: 5,
          } as Condition,
        ],
      };

      const responses = { field1: 'yes', field2: 10 };
      expect(evaluateComplexCondition(condition, responses)).toBe(true);
    });

    it('should evaluate AND operator with one false condition', () => {
      const condition: ComplexCondition = {
        operator: 'AND',
        conditions: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'yes',
          } as Condition,
          {
            fieldId: 'field2',
            operator: 'greaterThan',
            value: 5,
          } as Condition,
        ],
      };

      const responses = { field1: 'yes', field2: 3 };
      expect(evaluateComplexCondition(condition, responses)).toBe(false);
    });

    it('should evaluate OR operator with at least one true condition', () => {
      const condition: ComplexCondition = {
        operator: 'OR',
        conditions: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'yes',
          } as Condition,
          {
            fieldId: 'field2',
            operator: 'equals',
            value: 'no',
          } as Condition,
        ],
      };

      const responses = { field1: 'yes', field2: 'maybe' };
      expect(evaluateComplexCondition(condition, responses)).toBe(true);
    });

    it('should evaluate OR operator with all false conditions', () => {
      const condition: ComplexCondition = {
        operator: 'OR',
        conditions: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'yes',
          } as Condition,
          {
            fieldId: 'field2',
            operator: 'equals',
            value: 'no',
          } as Condition,
        ],
      };

      const responses = { field1: 'maybe', field2: 'maybe' };
      expect(evaluateComplexCondition(condition, responses)).toBe(false);
    });

    it('should evaluate NOT operator', () => {
      const condition: ComplexCondition = {
        operator: 'NOT',
        conditions: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'yes',
          } as Condition,
        ],
      };

      const responses1 = { field1: 'yes' };
      expect(evaluateComplexCondition(condition, responses1)).toBe(false);

      const responses2 = { field1: 'no' };
      expect(evaluateComplexCondition(condition, responses2)).toBe(true);
    });

    it('should handle nested complex conditions', () => {
      const condition: ComplexCondition = {
        operator: 'AND',
        conditions: [
          {
            operator: 'OR',
            conditions: [
              {
                fieldId: 'field1',
                operator: 'equals',
                value: 'yes',
              } as Condition,
              {
                fieldId: 'field2',
                operator: 'equals',
                value: 'yes',
              } as Condition,
            ],
          } as ComplexCondition,
          {
            fieldId: 'field3',
            operator: 'greaterThan',
            value: 5,
          } as Condition,
        ],
      };

      const responses1 = { field1: 'yes', field2: 'no', field3: 10 };
      expect(evaluateComplexCondition(condition, responses1)).toBe(true);

      const responses2 = { field1: 'no', field2: 'no', field3: 10 };
      expect(evaluateComplexCondition(condition, responses2)).toBe(false);
    });
  });

  describe('getConditionDependencies', () => {
    it('should extract dependencies from simple condition', () => {
      const condition: Condition = {
        fieldId: 'field1',
        operator: 'equals',
        value: 'yes',
      };

      const deps = getConditionDependencies(condition);
      expect(deps).toContain('field1');
      expect(deps.length).toBe(1);
    });

    it('should extract dependencies from complex condition', () => {
      const condition: ComplexCondition = {
        operator: 'AND',
        conditions: [
          {
            fieldId: 'field1',
            operator: 'equals',
            value: 'yes',
          } as Condition,
          {
            fieldId: 'field2',
            operator: 'greaterThan',
            value: 5,
          } as Condition,
        ],
      };

      const deps = getConditionDependencies(condition);
      expect(deps).toContain('field1');
      expect(deps).toContain('field2');
      expect(deps.length).toBe(2);
    });

    it('should handle nested complex conditions', () => {
      const condition: ComplexCondition = {
        operator: 'AND',
        conditions: [
          {
            operator: 'OR',
            conditions: [
              {
                fieldId: 'field1',
                operator: 'equals',
                value: 'yes',
              } as Condition,
              {
                fieldId: 'field2',
                operator: 'equals',
                value: 'yes',
              } as Condition,
            ],
          } as ComplexCondition,
          {
            fieldId: 'field3',
            operator: 'greaterThan',
            value: 5,
          } as Condition,
        ],
      };

      const deps = getConditionDependencies(condition);
      expect(deps).toContain('field1');
      expect(deps).toContain('field2');
      expect(deps).toContain('field3');
      expect(deps.length).toBe(3);
    });
  });
});
