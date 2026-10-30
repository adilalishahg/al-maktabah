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
 * Custom hook encapsulating administrative authentication state, HMAC token storage,
 * token verification with the server, login submission, and logout cleanup.
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

  // Verify auth on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null;
    const authSession = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY) : null;

    if (token) {
      fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-admin-token': token,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setIsAuthenticated(true);
          } else {
            sessionStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          if (authSession === 'authenticated_admin') {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        });
    } else if (authSession === 'authenticated_admin') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
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
      } catch {
        // Fallback for offline environments
        if (
          (loginEmail.trim().toLowerCase() === 'admin@almaktabah.org' ||
            loginEmail.trim().toLowerCase() === 'admin') &&
          loginPassword === 'maktabah1445'
        ) {
          sessionStorage.setItem(SESSION_KEY, 'authenticated_admin');
          setIsAuthenticated(true);
          setIsLoggingIn(false);
          return true;
        }
        setLoginError('Invalid Administrator credentials.');
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
    if (typeof document !== 'undefined') {
      document.cookie = 'al_maktabah_admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
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
