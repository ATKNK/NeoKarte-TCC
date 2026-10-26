import './Navbar.css';

function Navbar(props) {
    return (
        <nav className='navbarMain'>
            <p className='navbarTitle'>NeoKarte</p>
            <div className='navbarButtons'>
                <a className='navbarButton' href='/'>Map</a>
                <a className='navbarButton' href='/country-manager'>Country Manager</a>
            </div>
            <p>{props.teste} </p>
        </nav>
    )
}

export default Navbar;