import { useEffect, useRef, useState } from 'react';
import './SidePanel.css';

const MAX_FLAG_RETRIES = 3;

function FlagImage({ src, alt }) {
    const [attempt, setAttempt] = useState(0);
    const [reloadVersion, setReloadVersion] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const retryTimer = useRef(null);

    useEffect(() => () => window.clearTimeout(retryTimer.current), []);

    function handleError() {
        if (attempt < MAX_FLAG_RETRIES) {
            retryTimer.current = window.setTimeout(
                () => setAttempt((currentAttempt) => currentAttempt + 1),
                500 * (2 ** attempt)
            );
            return;
        }

        setHasFailed(true);
    }

    function handleManualRetry() {
        setAttempt(0);
        setHasFailed(false);
        setIsLoaded(false);
        setReloadVersion((version) => version + 1);
    }

    if (!src || hasFailed) {
        return (
            <div className='countryFlagPlaceholder' role='status'>
                {hasFailed ? (
                    <>
                        <span>Bandeira indisponível</span>
                        <button type='button' onClick={handleManualRetry}>
                            Tentar novamente
                        </button>
                    </>
                ) : 'Bandeira indisponível'}
            </div>
        );
    }

    return (
        <div className='countryFlagContainer' aria-busy={!isLoaded}>
            {!isLoaded && (
                <span className='countryFlagLoading' role='status'>
                    Carregando bandeira...
                </span>
            )}
            <img
                key={`${attempt}-${reloadVersion}`}
                className='countryFlag'
                alt={alt}
                src={src}
                loading='eager'
                decoding='async'
                onLoad={() => setIsLoaded(true)}
                onError={handleError}
            />
        </div>
    );
}

function SidePanel({
    year,
    ...countryData
}) {
    const {
        name,
        full_name,
        full_name_local,
        capitals,
        government_type,
        capital,
        govt,
        leader,
        rulers,
        flags,
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
    const activeFlag = flags?.find(({ start_date, end_date, start, end }) => {
        const flagStart = start_date || start;
        const flagEnd = end_date || end;
        return (!flagStart || flagStart <= selectedDate) && (!flagEnd || flagEnd >= selectedDate);
    });
    const leaderName = activeRuler?.person?.name || leader || '-';
    const leaderImage = portrait || activeRuler?.image;
    const flagImage = activeFlag?.image || activeFlag || flag?.image || flag;

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

                <FlagImage key={flagImage || name} src={flagImage} alt={`Bandeira de ${name}`} />

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