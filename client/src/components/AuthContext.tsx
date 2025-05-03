// src/context/AuthContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from 'react';
  import api from '../api';
  import { User, CompanyProfile } from '../types';
  import { jwtDecode } from 'jwt-decode';
  import { useNavigate } from 'react-router-dom';
  
  interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (
      email: string,
      password: string,
      role: 'company' | 'candidate',
      companyData?: Partial<CompanyProfile>
    ) => Promise<void>;
  }
  
  const AuthContext = createContext<AuthContextType>({} as AuthContextType);
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  
    useEffect(() => {
      const initAuth = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (token) {
            const { data } = await api.get('/users/me/');
            setUser(data);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        } finally {
          setLoading(false);
        }
      };
  
      initAuth();
    }, []);
  
    const handleAuthResponse = async (access: string, refresh: string) => {
      localStorage.setItem('accessToken', access);
      document.cookie = `refreshToken=${refresh}; Path=/; HttpOnly; SameSite=Lax`;
      
      const decoded: { user_id: number; email: string; role: string } = jwtDecode(access);
      const { data } = await api.get(`/users/${decoded.user_id}/`);
      setUser(data);
    };
  
    const login = async (email: string, password: string) => {
      try {
        const { data } = await api.post('/auth/login/', { email, password });
        await handleAuthResponse(data.access, data.refresh);
        navigate(user?.role === 'company' ? '/company/jobs' : '/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    };
  
    const logout = () => {
      localStorage.removeItem('accessToken');
      document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      setUser(null);
      navigate('/login');
    };
  
    const register = async (
      email: string,
      password: string,
      role: 'company' | 'candidate',
      companyData?: Partial<CompanyProfile>
    ) => {
      try {
        const { data } = await api.post('/auth/register/', {
          email,
          password,
          role,
          company_profile: role === 'company' ? companyData : undefined
        });
        await handleAuthResponse(data.access, data.refresh);
        navigate(role === 'company' ? '/company/jobs' : '/dashboard');
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
    };
  
    return (
      <AuthContext.Provider value={{ user, loading, login, logout, register }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };