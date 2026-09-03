import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  // @ts-ignore
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('astrology_saved_kundalis');
    } catch (e) {
      console.warn(e);
    }
    // @ts-ignore
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1c130b] text-amber-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-amber-950/90 border-2 border-amber-600/80 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-amber-900/80 rounded-full border border-amber-500/50 flex items-center justify-center mx-auto text-amber-300 font-serif text-2xl font-bold">
              ॐ
            </div>
            <h2 className="text-xl font-bold text-amber-100 font-serif">
              केही प्राविधिक समस्या आयो (System Error)
            </h2>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              डाटा लोड गर्दा वा गणना गर्दा त्रुटि भएको छ। कृपया पुन: प्रयास गर्नुहोस्।
            </p>
            {/* @ts-ignore */}
            {this.state.error && (
              <div className="bg-black/50 p-2.5 rounded-lg text-[10px] text-red-300 font-mono text-left overflow-x-auto max-h-24">
                {/* @ts-ignore */}
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 text-sm"
            >
              🔄 एप पुनः लोड गर्नुहोस् (Reload Application)
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
