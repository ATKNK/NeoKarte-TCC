import './SidePanel.css';

function SidePanel({ year, tag, name, fullName, fullNameLocal, capital, govt, leader, flag }) {

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

                <p className='countryMainName'>{name}</p>

                <img className='countryFlag' alt={`Flag of ${tag}`} src={flag || `/flags/${tag}.png`} />

                <p className='countryName'>{fullName}</p>
                <p className='countryName'>{fullNameLocal}</p>

                <p className='panelLabel'>Capital:</p>
                <p>{capital}</p>

                <p className='panelLabel'>Government:</p>
                <p>{govt}</p>


                <img className='leaderPortrait' src={`leaders/${tag} ${leader}.png`} alt={`Portrait of ${leader}`}/>
                <p className='leaderName'>{leader}</p>
            </div>
        </div>
    )
}

export default SidePanel