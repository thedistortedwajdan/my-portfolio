import { describe, expect, it } from 'vitest';
import { formatMonths, monthsInclusive, sinceLabel } from '../../src/lib/duration.js';

describe('duration', () => {
  it('counts calendar months touched, including the first and the current month', () => {
    expect(monthsInclusive('2024-11', new Date(2024, 10, 15))).toBe(1);
    expect(monthsInclusive('2024-11', new Date(2026, 9, 3))).toBe(24);
  });

  it('formats months as years and months', () => {
    expect(formatMonths(5)).toBe('5 mo');
    expect(formatMonths(12)).toBe('1 yr');
    expect(formatMonths(15)).toBe('1 yr 3 mo');
    expect(formatMonths(24)).toBe('2 yrs');
  });

  it('returns an empty string for impossible values', () => {
    expect(formatMonths(0)).toBe('');
    expect(formatMonths(Number.NaN)).toBe('');
    expect(sinceLabel('2030-01', new Date(2026, 9, 3))).toBe('');
  });
});
