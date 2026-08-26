import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  LogOut,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Crown,
  Key,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../types';

interface Props {
  language?: Language;
  onOpenAdminPanel?: () => void;
}

export const AuthModal: React.FC<Props> = ({
  language = 'ne',
  onOpenAdminPanel,
}) => {
  const {
    currentUser,
    isAdmin,
    isAuthModalOpen,
    closeAuthModal,
    loginAsSuperAdmin,
    logout,
  } = useAuth();

  const [adminPin, setAdminPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isNepali = language === 'ne';

  if (!isAuthModalOpen) return null;

  const handleAdminSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await loginAsSuperAdmin(adminPin);
      setSuccessMsg(
        isNepali
          ? 'स्वागत छ! मुख्य व्यवस्थापक (Super Admin) प्रमाणित भयो। एडमिन प्यानल सक्रिय भयो।'
          : 'Welcome! Super Admin verified. Admin panel unlocked.'
      );
      setTimeout(() => {
        if (onOpenAdminPanel) {
          closeAuthModal();
          onOpenAdminPanel();
        }
      }, 600);
    } catch (err: any) {
      setErrorMsg(err?.message || (isNepali ? 'मास्टर की अमान्य छ।' : 'Invalid Master Key'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 px-5 py-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-amber-200 text-base">
                {isNepali ? 'व्यवस्थापक प्रमाणीकरण' : 'Admin Authentication'}
              </h3>
              <p className="text-[11px] text-amber-400/80">
                {isNepali ? 'पण्डित शम्भु प्रसाद लम्साल' : 'Pandit Shambhu Prasad Lamsal'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Current User Status Banner */}
          {currentUser && (
            <div
              className={`p-3.5 rounded-xl border ${
                isAdmin
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      isAdmin
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    👑
                  </div>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <span>{currentUser.customerName || currentUser.displayName || (isNepali ? 'मुख्य व्यवस्थापक' : 'Super Admin')}</span>
                      {isAdmin && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase">
                          Super Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] mt-0.5 text-slate-400">
                      {isNepali ? 'मास्टर की पहुँच' : 'Master Key Access'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-1 transition shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isNepali ? 'लग आउट' : 'Logout'}</span>
                </button>
              </div>

              {/* Quick Jump to Admin Panel */}
              {isAdmin && onOpenAdminPanel && (
                <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between">
                  <span className="text-xs text-amber-300">
                    {isNepali ? 'इजाजतपत्र व्यवस्थापन:' : 'License Manager:'}
                  </span>
                  <button
                    onClick={() => {
                      closeAuthModal();
                      onOpenAdminPanel();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isNepali ? 'एडमिन प्यानल खोल्नुहोस्' : 'Open Admin Panel'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Master Key Verification Form */}
          {!isAdmin && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-white">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>{isNepali ? 'मास्टर की प्रमाणीकरण' : 'Master Key Authentication'}</span>
                </div>
                <p className="text-[11px] text-amber-300/80">
                  {isNepali
                    ? 'व्यवस्थापक प्यानल खोल्न आधिकारिक गोप्य मास्टर की (Master Key) प्रविष्ट गर्नुहोस्।'
                    : 'Enter your authorized Secret Master Key to unlock the Admin Panel.'}
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isNepali ? 'गोप्य मास्टर की (Secret Master Key):' : 'Secret Master Key:'}
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder={isNepali ? 'यहाँ गोप्य मास्टर की राख्नुहोस्' : 'Enter Secret Master Key'}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-white text-xs sm:text-sm placeholder:text-slate-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !adminPin.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{isNepali ? 'मास्टर की प्रमाणीकरण गर्नुहोस्' : 'Verify Master Key & Unlock'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
