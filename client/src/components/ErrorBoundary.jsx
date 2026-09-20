import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

/**
 * ==============================================================================
 * ErrorBoundary Component
 * ==============================================================================
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a graceful fallback UI instead of the
 * white screen of death.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for diagnostics
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback provided, render that
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default branded fallback view
      return (
        <div style={{
          minHeight: this.props.minimal ? 'auto' : '60vh',
          padding: this.props.minimal ? '24px 16px' : '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: this.props.minimal ? '#FDFBF7' : 'transparent',
          borderRadius: 20,
          margin: this.props.minimal ? '12px 0' : '0 auto',
          maxWidth: 640,
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#fde8d8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            color: '#E8633A',
          }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{
            margin: '0 0 8px',
            fontSize: 20,
            fontWeight: 700,
            color: '#231E1B',
            fontFamily: '"Playfair Display", serif',
          }}>
            {this.props.title || 'Something went wrong rendering this section'}
          </h3>
          <p style={{
            color: '#665D57',
            fontSize: 14,
            maxWidth: 420,
            lineHeight: 1.6,
            margin: '0 0 20px',
          }}>
            {this.props.message || 'We encountered a momentary display issue. You can refresh or return to explore other skincare formulations.'}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 24,
                background: '#E8633A',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(232, 99, 58, 0.25)',
              }}
            >
              <RefreshCw size={15} /> Try Again
            </button>
            {this.props.showBackButton && (
              <button
                onClick={() => window.history.back()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 24,
                  background: '#F6EFE9',
                  color: '#665D57',
                  border: '1px solid #EADFD4',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={15} /> Go Back
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
