import React from 'react';

export interface AdminLoginCardProps {
  loginEmail: string;
  setLoginEmail: (value: string) => void;
  loginPassword: string;
  setLoginPassword: (value: string) => void;
  loginError: string;
  handleLogin: (e: React.FormEvent) => void;
}

export const AdminLoginCard: React.FC<AdminLoginCardProps> = ({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginError,
  handleLogin,
}) => {
  return (
    <div className="min-h-screen bg-night-canvas text-night-text flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-emerald-card border border-emerald-border rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <span className="w-12 h-12 rounded-2xl bg-primary-container border border-emerald-highlight/30 text-tertiary-fixed inline-flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </span>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Al-Maktabah Admin Gate
          </h1>
          <p className="text-xs text-emerald-highlight">
            Restricted portal for manuscript custodians, chief editors, and archive administrators.
          </p>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-red-400">error</span>
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-highlight mb-1">
              Admin Email / Username
            </label>
            <input
              type="text"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="admin@almaktabah.org"
              className="w-full px-3.5 py-2.5 rounded-xl bg-night-surface border border-emerald-border text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-highlight"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-highlight mb-1">
              Security Password
            </label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-night-surface border border-emerald-border text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-highlight"
            />
          </div>

          <div className="p-3 rounded-lg bg-night-surface/60 border border-emerald-border text-label-sm text-on-primary-container space-y-0.5">
            <span className="font-semibold block text-white">Default Admin Credentials:</span>
            <div>Username: <code className="bg-surface-container px-1 rounded text-white">admin@almaktabah.org</code></div>
            <div>Password: <code className="bg-surface-container px-1 rounded text-white">maktabah1445</code></div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-primary-container hover:bg-emerald-surface text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-emerald-highlight/30"
          >
            <span className="material-symbols-outlined text-lg">lock_open</span>
            <span>Authenticate &amp; Access Dashboard</span>
          </button>
        </form>

        <div className="pt-2 text-center">
          <a
            href="/"
            className="text-xs text-emerald-highlight hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Return to Public Library</span>
          </a>
        </div>
      </div>
    </div>
  );
};

