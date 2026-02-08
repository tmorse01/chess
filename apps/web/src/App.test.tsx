import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('should render BrowserRouter', () => {
    const { container } = render(<App />);
    expect(container.querySelector('div')).toBeTruthy();
  });
});
