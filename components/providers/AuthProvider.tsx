"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ACCOUNT_STORAGE_KEY = "ahorramas-account";

export interface AccountUser {
    id: string;
    nombre: string;
    email: string;
    compraVerificada: boolean;
}

interface AuthContextType {
    user: AccountUser | null;
    isLoading: boolean;
    login: (data: AccountUser) => void;
    logout: () => void;
    updateUser: (data: Partial<AccountUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AccountUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch {
            // Error al leer el storage
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (data: AccountUser) => {
        setUser(data);
        try {
            window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(data));
        } catch {
            // Error al guardar
        }
    };

    const logout = () => {
        setUser(null);
        try {
            window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);
        } catch {
            // Error al limpiar
        }
    };

    const updateUser = (data: Partial<AccountUser>) => {
        if (!user) return;
        const updated = { ...user, ...data };
        setUser(updated);
        try {
            window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(updated));
        } catch {
            // Error al guardar
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de AuthProvider");
    }
    return context;
}
