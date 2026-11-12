import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

function RequireAuth() {
    const { status, sessionError, refreshSession } = useAuth();
    const location = useLocation();

    if (status === 'loading') {
        return <p role="status">Verificando sessão...</p>;
    }

    if (status === 'error') {
        return (
            <section role="alert">
                <p>Não foi possível verificar sua sessão: {sessionError}</p>
                <button type="button" onClick={refreshSession}>Tentar novamente</button>
            </section>
        );
    }

    if (status !== 'authenticated') {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

export default RequireAuth;
