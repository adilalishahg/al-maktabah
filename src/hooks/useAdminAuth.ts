import { useState, useEffect, useCallback } from 'react';

export interface UseAdminAuthReturn {
  isAuthenticated: boolean | null;
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  loginError: string;
  setLoginError: (error: string) => void;
  isLoggingIn: boolean;
  getAuthHeaders: (extraHeaders?: Record<string, string>) => Record<string, string>;
  handleLogin: (e?: React.FormEvent) => Promise<boolean>;
  handleLogout: () => void;
}

const TOKEN_KEY = 'al_maktabah_admin_token';
const SESSION_KEY = 'al_maktabah_admin_session';

/**
 * Custom hook encapsulating administrative authentication state, cryptographic token handling,
 * server verification probes, login submission, and logout cleanup.
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Helper to attach HMAC Authorization & x-admin-token headers
  const getAuthHeaders = useCallback((extraHeaders?: Record<string, string>): Record<string, string> => {
    const headers: Record<string, string> = { ...extraHeaders };
    const token = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-admin-token'] = token;
    }
    return headers;
  }, []);

  // Verify auth on mount via server cryptographic probe (Zero-Trust)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null;
    const reqHeaders: Record<string, string> = {};
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
      reqHeaders['x-admin-token'] = token;
    }

    fetch('/api/auth/verify', {
      headers: reqHeaders,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setIsAuthenticated(true);
        } else {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
          }
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // Handle Login via /api/auth/login endpoint
  const handleLogin = useCallback(
    async (e?: React.FormEvent): Promise<boolean> => {
      if (e) e.preventDefault();
      setLoginError('');
      setIsLoggingIn(true);

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.token) {
          sessionStorage.setItem(SESSION_KEY, 'authenticated_admin');
          sessionStorage.setItem(TOKEN_KEY, data.token);
          setIsAuthenticated(true);
          setIsLoggingIn(false);
          return true;
        }

        setLoginError(data.message || 'Invalid Administrator credentials.');
        setIsLoggingIn(false);
        return false;
      } catch (err: any) {
        setLoginError(err.message || 'Network error occurred during authentication.');
        setIsLoggingIn(false);
        return false;
      }
    },
    [loginEmail, loginPassword]
  );

  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    }
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
  }, []);

  return {
    isAuthenticated,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    setLoginError,
    isLoggingIn,
    getAuthHeaders,
    handleLogin,
    handleLogout,
  };
}
