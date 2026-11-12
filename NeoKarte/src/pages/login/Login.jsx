import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import './login.css';

function getErrorMessage(error) {
    return error?.response?.data?.error
        ?? error?.response?.data?.message
        ?? (error instanceof Error ? error.message : 'Não foi possível entrar.');
}

function Login() {
    const { status, sessionError, login, refreshSession } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (status === 'loading') {
        return <p role="status">Verificando sessão...</p>;
    }

    if (status === 'error') {
        return (
            <section className="loginMain" role="alert">
                <div>
                    <p className="loginError">Não foi possível verificar sua sessão: {sessionError}</p>
                    <button type="button" onClick={refreshSession}>Tentar novamente</button>
                </div>
            </section>
        );
    }

    if (status === 'authenticated') {
        const destination = location.state?.from;
        const path = destination
            ? `${destination.pathname}${destination.search ?? ''}${destination.hash ?? ''}`
            : '/country-manager';
        return <Navigate to={path} replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const authenticated = await login({ emailAddress, password });
            if (!authenticated) {
                throw new Error('O login foi aceito, mas a sessão não pôde ser confirmada.');
            }
            const destination = location.state?.from;
            navigate(destination
                ? `${destination.pathname}${destination.search ?? ''}${destination.hash ?? ''}`
                : '/country-manager', { replace: true });
        } catch (loginError) {
            setError(getErrorMessage(loginError));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="loginMain">
            <form className="loginForm" onSubmit={handleSubmit}>
                <h1>Entrar no NeoKarte</h1>
                <label htmlFor="emailAddress">E-mail</label>
                <input
                    id="emailAddress"
                    name="email_address"
                    type="email"
                    autoComplete="username"
                    value={emailAddress}
                    onChange={(event) => setEmailAddress(event.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <label htmlFor="password">Senha</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                </button>
                {error && <p className="loginError" role="alert">{error}</p>}
            </form>
        </main>
    );
}

export default Login;
