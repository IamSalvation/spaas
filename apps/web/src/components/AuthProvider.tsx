'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    token: string | null;
    user: any | null; // Store the whole user object
    login: (email: string, pass: string, tenantId: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedToken = localStorage.getItem('spaas_token');
        const savedUser = localStorage.getItem('spaas_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (email: string, pass: string, tenantId: string) => {
        const res = await api.post('/auth/login', { email, password: pass, tenantId });
        localStorage.setItem('spaas_token', res.data.access_token);
        localStorage.setItem('spaas_user', JSON.stringify(res.data.user)); // Save user
        setToken(res.data.access_token);
        setUser(res.data.user);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('spaas_token');
        localStorage.removeItem('spaas_user');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};