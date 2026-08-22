import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  name: string;
  profile_picture: string;
  language: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  currency: 'USD' | 'INR';
  setCurrency: (currency: 'USD' | 'INR') => void;
  formatPrice: (usdPrice: number) => string;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  apiFetch: (path: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gt_token'));
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://127.0.0.1:8000'; // Fallback to direct absolute URL if running on different ports

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    
    // Add auth headers if token is present
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, { ...options, headers });
    
    if (res.status === 401) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }

    if (res.status === 204) return null;
    return res.json();
  };

  const fetchProfile = async (authToken: string) => {
    try {
      const url = `${API_BASE}/api/auth/me`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (e) {
      console.error("Failed to load user profile:", e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (newToken: string) => {
    localStorage.setItem('gt_token', newToken);
    setToken(newToken);
    setLoading(true);
    await fetchProfile(newToken);
  };

  const logout = () => {
    localStorage.removeItem('gt_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const [currency, setCurrencyState] = useState<'USD' | 'INR'>(() => {
    return (localStorage.getItem('gt_currency') as 'USD' | 'INR') || 'INR'; // default to INR (Rupees)
  });

  const setCurrency = (curr: 'USD' | 'INR') => {
    localStorage.setItem('gt_currency', curr);
    setCurrencyState(curr);
  };

  const formatPrice = (usdPrice: number) => {
    if (currency === 'INR') {
      const inrValue = Math.round(usdPrice * 83); // 1 USD = 83 INR
      return `₹${inrValue.toLocaleString('en-IN')}`;
    }
    return `$${usdPrice.toLocaleString('en-US')}`;
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, currency, setCurrency, formatPrice, login, logout, updateUser, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
