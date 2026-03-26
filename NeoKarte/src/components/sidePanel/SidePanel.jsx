import './SidePanel.css';

function SidePanel({ year, tag, name, fullName, fullNameLocal, capital, govt, leader }) {

    if (!name) {
        return (
            <div className='sidePanelMain'>
                <header className='sidePanelYear'>{year}</header>
                <div className='countryPanel'>
                    <p>Selecione um País</p>
                </div>
            </div>
        )
    }

    return (
        <div className='sidePanelMain'>
            <header className='sidePanelYear'>{year}</header>
            <div className='countryPanel'>

                <p className='countryName'>{fullName}</p>
                <p className='countryName'>{fullNameLocal}</p>

                <img className='countryFlag' alt={`Flag of${name}`} src={`flags/${tag}.png`} />

                <p className='panelLabel'>Capital:</p>
                <p>{capital}</p>

                <p className='panelLabel'>Government:</p>
                <p>{govt}</p>


                <img className='leaderPortrait' alt={`Portrait of ${leader}`} src={``}/>
                <p className='leaderName'>{leader}</p>
            </div>
        </div>
    )
}

export default SidePanel