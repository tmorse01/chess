import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
  });

  it('renders custom fallback title when provided', () => {
    render(
      <ErrorBoundary fallbackTitle="Custom Error Title">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
  });

  it('shows error message in dev mode', () => {
    // Note: Tests run in dev mode by default, so we don't need to mock the environment
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // In dev mode, the error message should be visible
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('displays Try Again and Return Home buttons', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Return Home')).toBeInTheDocument();
  });

  it('resets error state when Try Again is clicked', () => {
    let shouldThrow = true;
    const ThrowErrorDynamic = () => {
      if (shouldThrow) {
        throw new Error('Test error message');
      }
      return <div>Normal content</div>;
    };

    render(
      <ErrorBoundary>
        <ThrowErrorDynamic />
      </ErrorBoundary>
    );

    // Component threw, error UI is showing
    expect(screen.getByText('Try Again')).toBeInTheDocument();

    // Change behavior to not throw
    shouldThrow = false;

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    // After reset, component should render normally
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('navigates to home when Return Home is clicked', () => {
    const originalLocation = window.location;
    const hrefSetter = vi.fn();
    delete (window as any).location;
    // @ts-expect-error - Mocking window.location for test purposes
    window.location = {
      ...originalLocation,
      set href(value: string) {
        hrefSetter(value);
      },
      get href() {
        return hrefSetter.mock.lastCall?.[0] || '';
      },
    };

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const returnHomeButton = screen.getByText('Return Home');
    fireEvent.click(returnHomeButton);

    expect(hrefSetter).toHaveBeenCalledWith('/');

    // @ts-expect-error - Restoring original window.location
    window.location = originalLocation;
  });
});
