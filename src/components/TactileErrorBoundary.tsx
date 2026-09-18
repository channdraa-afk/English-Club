import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { sound } from '../lib/audio';
import { TactileButton } from './TactileButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TactileErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by TactileErrorBoundary:', error, errorInfo);
    try {
      sound.playError();
    } catch {
      // Audio fallback
    }
  }

  private handleReload = () => {
    sound.playPop();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl border-2 border-slate-200 shadow-[0_6px_0_0_#cbd5e1] p-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-600 flex items-center justify-center shadow-[0_3px_0_0_#fcd34d]">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                Terjadi Kendala Tampilan
              </h2>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                Browsermu atau ekstensi terpasang memblokir salah satu fungsi aplikasi. Jangan khawatir, datamu tetap aman!
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] font-mono text-slate-600 text-left overflow-auto max-h-24">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>

            <div className="pt-2">
              <TactileButton
                type="button"
                variant="brand"
                size="md"
                onClick={this.handleReload}
                className="w-full justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                <span>Muat Ulang Halaman</span>
              </TactileButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
