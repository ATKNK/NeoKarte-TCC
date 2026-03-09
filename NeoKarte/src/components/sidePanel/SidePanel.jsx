import './SidePanel.css';

function SidePanel(props) {
    return (
        <div className='sidePanelMain'>
            <header className='sidePanelYear'>{props.year}</header>
            <div className='countryPanel'>

                <p className='countryName'>{props.name}</p>
                <p className='countryName'>{props.nameLocal}</p>

                <img className='countryFlag' src='https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_Austria.svg'></img>

                <p className='panelLabel'>Capital:</p>
                <p>{props.capital}</p>

                <p className='panelLabel'>Government:</p>
                <p>{props.govt}</p>


                <img className='leaderPortrait' src='https://upload.wikimedia.org/wikipedia/commons/7/79/Hans_Burgkmair_d._%C3%84._%28zugeschr.%29_-_Bildnis_Kaiser_Friedrich_III.jpg'></img>
                <p className='leaderName'>{props.leader}</p>
            </div>
        </div>
    )
}

export default SidePanel