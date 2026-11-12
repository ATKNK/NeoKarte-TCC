import { useCallback, useEffect, useState } from 'react';
import { getCurrentUser, signIn, signOut } from '../modules/auth/auth';
import AuthContext from './context';

function getSessionResult() {
    return getCurrentUser()
        .then((user) => ({ status: 'authenticated', user }))
        .catch((error) => {
            if (error?.response?.status === 401) {
                return { status: 'unauthenticated', user: null };
            }
            return {
                status: 'error',
                user: null,
                error: error?.response?.data?.error
                    ?? error?.response?.data?.message
                    ?? (error instanceof Error ? error.message : 'Não foi possível verificar a sessão.'),
            };
        });
}

export function AuthProvider({ children }) {
    const [status, setStatus] = useState('loading');
    const [user, setUser] = useState(null);
    const [sessionError, setSessionError] = useState('');

    const applySessionResult = useCallback((result) => {
        setUser(result.user);
        setSessionError(result.error ?? '');
        setStatus(result.status);
    }, []);

    const refreshSession = useCallback(async () => {
        setStatus('loading');
        setSessionError('');
        const result = await getSessionResult();
        applySessionResult(result);
        return result.status === 'authenticated';
    }, [applySessionResult]);

    useEffect(() => {
        let isMounted = true;
        getSessionResult().then((result) => {
            if (isMounted) {
                applySessionResult(result);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [applySessionResult]);

    const login = useCallback(async (credentials) => {
        await signIn(credentials);
        return refreshSession();
    }, [refreshSession]);

    const logout = useCallback(async () => {
        await signOut();
        setUser(null);
        setStatus('unauthenticated');
    }, []);

    return (
        <AuthContext.Provider
            value={{ status, user, sessionError, login, logout, refreshSession }}
        >
            {children}
        </AuthContext.Provider>
    );
}
