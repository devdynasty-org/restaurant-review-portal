// Unit tests for the shared UI helpers.
// These import only ui.js (React + design tokens), so they avoid the
// react-router-dom v7 / react-scripts 5 Jest resolver incompatibility that
// affects anything importing App or the page components.
import { render } from '@testing-library/react';
import { avgOf, relativeDate, PriceLevel } from './ui';

describe('avgOf', () => {
  test('averages the values of a category-rating object', () => {
    expect(avgOf({ food: 5, service: 4, ambiance: 4, value: 3 })).toBe(4);
  });
});

describe('relativeDate', () => {
  test('returns a recent label for a date within the last few days', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(relativeDate(today)).toMatch(/Today|Yesterday|days ago/);
  });

  test('formats a date roughly a year ago in months', () => {
    const past = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
    expect(relativeDate(past)).toMatch(/months ago/);
  });
});

describe('PriceLevel', () => {
  test('renders four dollar symbols regardless of level', () => {
    const { container } = render(<PriceLevel level={2} />);
    expect(container.textContent).toBe('$$$$');
  });
});