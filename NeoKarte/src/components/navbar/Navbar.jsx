import './Navbar.css';

function Navbar(props) {
    return (
        <nav className='navbarMain'>
            <p className='navbarTitle'>NeoKarte</p>
        <p>{props.teste} </p>
        </nav>
    )
}

export default Navbar;