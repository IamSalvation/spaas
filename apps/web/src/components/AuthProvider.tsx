'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    token: string | null;
    login: (email: string, pass: string, tenantId: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedToken = localStorage.getItem('spaas_token');
        if (savedToken) setToken(savedToken);
    }, []);

    const login = async (email: string, pass: string, tenantId: string) => {
        const res = await api.post('/auth/login', { email, password: pass, tenantId });
        localStorage.setItem('spaas_token', res.data.access_token);
        setToken(res.data.access_token);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('spaas_token');
        setToken(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};