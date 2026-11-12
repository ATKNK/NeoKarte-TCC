import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import './Navbar.css';

function Navbar() {
    const { status, logout } = useAuth();
    const [logoutError, setLogoutError] = useState('');

    async function handleLogout() {
        setLogoutError('');
        try {
            await logout();
        } catch (error) {
            setLogoutError(
                error?.response?.data?.error
                    ?? error?.response?.data?.message
                    ?? (error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.')
            );
        }
    }

    return (
        <nav className='navbarMain'>
            <p className='navbarTitle'>NeoKarte</p>
            <div className='navbarButtons'>
                <Link className='navbarButton' to='/'>Mapa</Link>
                {status === 'authenticated' && (
                    <>
                        <Link className='navbarButton' to='/country-manager'>Países</Link>
                        <Link className='navbarButton' to='/people-manager'>Pessoas</Link>
                        <Link className='navbarButton' to='/event-manager'>Eventos</Link>
                    </>
                )}
                {status === 'unauthenticated' && (
                    <Link className='navbarButton' to='/login'>Entrar</Link>
                )}
                {status === 'authenticated' && (
                    <button className='navbarButton' type='button' onClick={handleLogout}>
                        Sair
                    </button>
                )}
            </div>
            {logoutError && <p className='navbarError' role='alert'>{logoutError}</p>}
        </nav>
    )
}

export default Navbar;