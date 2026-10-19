import './SidePanel.css';

function SidePanel({
    year,
    ...countryData
}) {
    const {
        tag,
        name,
        full_name,
        full_name_local,
        capitals,
        government_type,
        capital,
        govt,
        leader,
        rulers,
        flag,
        portrait
    } = countryData;
    const capitalNames = capitals
        ?.filter((item) => item?.name)
        .map((item) => item.name)
        .join(', ');
    const capitalDisplay = capitalNames || capital || '-';
    const governmentDisplay = government_type?.name || govt || '-';

    const selectedDate = `${year}-11-11`;
    const activeRuler = rulers?.find(({ start, end }) =>
        (!start || start <= selectedDate) && (!end || end >= selectedDate)
    );
    const leaderName = activeRuler?.person?.name || leader || '-';
    const leaderImage = portrait || activeRuler?.image;
    const flagImage = flag?.image || flag;

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

                <img className='countryFlag' alt={`Flag of ${name}`} src={flagImage} />

                <p className='countryName'>{full_name}</p>
                <p className='countryName'>{full_name_local}</p>

                <div className='countryInfo'>
                    <div className='countryInfoItem'>
                        <p className='panelLabel'>Capital:</p>
                        <p>{capitalDisplay}</p>
                    </div>

                    <div className='countryInfoItem'>
                        <p className='panelLabel'>Government:</p>
                        <p>{governmentDisplay}</p>
                    </div>
                </div>

                {leaderName !== '-' && (
                    <>
                        {leaderImage && (
                            <img className='leaderPortrait' src={leaderImage} alt={`Portrait of ${leaderName}`} />
                        )}
                        <p className='leaderName'>{leaderName}</p>
                    </>
                )}
            </div>
        </div>
    )
}

export default SidePanel