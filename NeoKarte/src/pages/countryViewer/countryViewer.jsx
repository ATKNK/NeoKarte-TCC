import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
    createPoliticalEra,
    getAllDynasties,
    getAllGovernmentTypes,
    getCountryById,
    getPoliticalEras,
} from '../../modules/maps/getCountry';
import './countryViewer.css';

function getFlagImage(flag) {
    if (typeof flag === 'string') {
        return flag;
    }
    return flag?.image;
}

function formatDateRange(startDate, endDate) {
    if (startDate && endDate) {
        return `${startDate} – ${endDate}`;
    }
    return startDate || endDate || 'Período não informado';
}

function sortRulersByReign(rulers) {
    return [...rulers].sort((first, second) => {
        const firstStart = Date.parse(first.start ?? first.start_date ?? '');
        const secondStart = Date.parse(second.start ?? second.start_date ?? '');
        const normalizedFirstStart = Number.isNaN(firstStart) ? Infinity : firstStart;
        const normalizedSecondStart = Number.isNaN(secondStart) ? Infinity : secondStart;

        return normalizedFirstStart - normalizedSecondStart;
    });
}

function EraList({ title, items, renderItem }) {
    if (!items.length) {
        return null;
    }

    return (
        <div className='countryViewerEraDetail'>
            <h4>{title}</h4>
            <ul>{items.map(renderItem)}</ul>
        </div>
    );
}

function EraCarousel({ title, items, renderSlide }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!items.length) {
        return null;
    }

    const safeIndex = Math.min(activeIndex, items.length - 1);

    return (
        <section className='countryViewerEraCarousel' aria-label={title}>
            <h4>{title}</h4>
            <div className='countryViewerCarouselSlide' aria-live='polite'>
                {renderSlide(items[safeIndex], safeIndex)}
            </div>
            {items.length > 1 && (
                <div className='countryViewerCarouselControls'>
                    <button
                        type='button'
                        aria-label={`Anterior: ${title}`}
                        onClick={() => setActiveIndex((safeIndex - 1 + items.length) % items.length)}
                    >
                        Anterior
                    </button>
                    <span>{safeIndex + 1} / {items.length}</span>
                    <button
                        type='button'
                        aria-label={`Próximo: ${title}`}
                        onClick={() => setActiveIndex((safeIndex + 1) % items.length)}
                    >
                        Próximo
                    </button>
                </div>
            )}
        </section>
    );
}

function CountryViewer() {
    const { id } = useParams();
    const location = useLocation();
    const isPoliticalErasPage = location.pathname.endsWith('/political_eras');
    const [country, setCountry] = useState(null);
    const [politicalEras, setPoliticalEras] = useState([]);
    const [dynastyNames, setDynastyNames] = useState({});
    const [dynasties, setDynasties] = useState([]);
    const [governmentTypes, setGovernmentTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newEra, setNewEra] = useState({
        name: '',
        full_name: '',
        full_name_local: '',
        start_date: '',
        end_date: '',
        dynasty_id: '',
        government_type_id: '',
    });
    const [isCreatingEra, setIsCreatingEra] = useState(false);
    const [createEraError, setCreateEraError] = useState('');
    const [createEraSuccess, setCreateEraSuccess] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function loadCountryData() {
            setIsLoading(true);
            setError('');

            try {
                const countryResponse = await getCountryById(id);
                const countryData = countryResponse?.country ?? countryResponse;
                if (!countryData || typeof countryData !== 'object') {
                    throw new Error('A resposta do servidor não contém os dados do país.');
                }

                if (isMounted) {
                    setCountry(countryData);
                }

                if (isPoliticalErasPage) {
                    const [erasResponse, dynastyResponse, governmentTypeResponse] = await Promise.all([
                        getPoliticalEras(id),
                        getAllDynasties(),
                        getAllGovernmentTypes(),
                    ]);
                    const eras = Array.isArray(erasResponse)
                        ? erasResponse
                        : erasResponse?.political_eras ?? erasResponse?.data;
                    if (!Array.isArray(eras)) {
                        throw new Error('A resposta do servidor não contém uma lista de eras políticas.');
                    }
                    if (!Array.isArray(dynastyResponse) || !Array.isArray(governmentTypeResponse)) {
                        throw new Error('Não foi possível carregar as opções de dinastia e tipo de governo.');
                    }

                    if (isMounted) {
                        setPoliticalEras(eras);
                        setDynasties(dynastyResponse);
                        setGovernmentTypes(governmentTypeResponse);
                        setDynastyNames(Object.fromEntries(
                            dynastyResponse.map((dynasty) => [dynasty.id, dynasty.name])
                        ));
                    }
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError instanceof Error ? loadError.message : 'Erro desconhecido.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadCountryData();
        return () => {
            isMounted = false;
        };
    }, [id, isPoliticalErasPage]);

    async function handleCreatePoliticalEra(event) {
        event.preventDefault();
        setCreateEraError('');
        setCreateEraSuccess('');

        if (newEra.end_date < newEra.start_date) {
            setCreateEraError('A data final deve ser igual ou posterior à data inicial.');
            return;
        }

        const politicalEra = {
            name: newEra.name.trim(),
            full_name: newEra.full_name.trim(),
            full_name_local: newEra.full_name_local.trim(),
            start_date: newEra.start_date,
            end_date: newEra.end_date,
            dynasty_id: newEra.dynasty_id ? Number(newEra.dynasty_id) : null,
            government_type_id: newEra.government_type_id
                ? Number(newEra.government_type_id)
                : null,
        };

        setIsCreatingEra(true);
        try {
            await createPoliticalEra(id, politicalEra);
            setNewEra({
                name: '',
                full_name: '',
                full_name_local: '',
                start_date: '',
                end_date: '',
                dynasty_id: '',
                government_type_id: '',
            });
            setCreateEraSuccess(`${politicalEra.name} foi criada com sucesso.`);

            try {
                const erasResponse = await getPoliticalEras(id);
                const eras = Array.isArray(erasResponse)
                    ? erasResponse
                    : erasResponse?.political_eras ?? erasResponse?.data;
                if (!Array.isArray(eras)) {
                    throw new Error('A resposta do servidor não contém uma lista de eras políticas.');
                }
                setPoliticalEras(eras);
            } catch (refreshError) {
                setCreateEraError(
                    `Era criada, mas não foi possível atualizar a lista: ${
                        refreshError instanceof Error ? refreshError.message : 'Erro desconhecido.'
                    }`
                );
            }
        } catch (createError) {
            const responseMessage = createError?.response?.data?.error
                ?? createError?.response?.data?.message;
            setCreateEraError(
                responseMessage
                    ?? (createError instanceof Error ? createError.message : 'Erro desconhecido.')
            );
        } finally {
            setIsCreatingEra(false);
        }
    }

    if (isLoading) {
        return <main className='countryViewerMain' role='status'>Carregando dados do país...</main>;
    }

    if (error) {
        return (
            <main className='countryViewerMain'>
                <p className='countryViewerError' role='alert'>Não foi possível carregar os dados: {error}</p>
            </main>
        );
    }

    if (!country) {
        return <main className='countryViewerMain'>País não encontrado.</main>;
    }

    const countryName = country.name ?? country.full_name ?? country.full_name_local ?? `País ${id}`;

    return (
        <main className='countryViewerMain'>
            <header className='countryViewerHeader'>
                <div>
                    <h1 className='countryViewerTitle'>{countryName}</h1>
                    {country.tag && <p className='countryViewerTag'>Tag: {country.tag}</p>}
                </div>
                <nav className='countryViewerNavigation' aria-label='Navegação do país'>
                    <Link to={`/countries/${id}`}>Dados do país</Link>
                    <Link to={`/countries/${id}/political_eras`}>Eras políticas</Link>
                </nav>
            </header>

            {!isPoliticalErasPage ? (
                <section className='countryViewerPanel' aria-labelledby='countryDataTitle'>
                    <h2 id='countryDataTitle'>Dados do país</h2>
                    <dl className='countryViewerDetails'>
                        <div className='countryViewerDetail'>
                            <dt>Nome</dt>
                            <dd>{countryName}</dd>
                        </div>
                        {country.tag && (
                            <div className='countryViewerDetail'>
                                <dt>Tag</dt>
                                <dd>{country.tag}</dd>
                            </div>
                        )}
                    </dl>
                </section>
            ) : (
                <section className='countryViewerPanel' aria-labelledby='politicalErasTitle'>
                    <h2 id='politicalErasTitle'>Eras políticas</h2>
                    <form className='countryViewerEraForm' onSubmit={handleCreatePoliticalEra}>
                        <h3>Criar era política</h3>
                        <div className='countryViewerEraFormGrid'>
                            <label>
                                Nome *
                                <input
                                    type='text'
                                    name='name'
                                    value={newEra.name}
                                    onChange={(event) => setNewEra((current) => ({ ...current, name: event.target.value }))}
                                    required
                                    disabled={isCreatingEra}
                                />
                            </label>
                            <label>
                                Nome oficial
                                <input
                                    type='text'
                                    name='full_name'
                                    value={newEra.full_name}
                                    onChange={(event) => setNewEra((current) => ({ ...current, full_name: event.target.value }))}
                                    disabled={isCreatingEra}
                                />
                            </label>
                            <label>
                                Nome oficial local
                                <input
                                    type='text'
                                    name='full_name_local'
                                    value={newEra.full_name_local}
                                    onChange={(event) => setNewEra((current) => ({ ...current, full_name_local: event.target.value }))}
                                    disabled={isCreatingEra}
                                />
                            </label>
                            <label>
                                Data inicial *
                                <input
                                    type='date'
                                    name='start_date'
                                    value={newEra.start_date}
                                    onChange={(event) => setNewEra((current) => ({ ...current, start_date: event.target.value }))}
                                    required
                                    disabled={isCreatingEra}
                                />
                            </label>
                            <label>
                                Data final *
                                <input
                                    type='date'
                                    name='end_date'
                                    value={newEra.end_date}
                                    onChange={(event) => setNewEra((current) => ({ ...current, end_date: event.target.value }))}
                                    required
                                    disabled={isCreatingEra}
                                />
                            </label>
                            <label>
                                Dinastia
                                <select
                                    name='dynasty_id'
                                    value={newEra.dynasty_id}
                                    onChange={(event) => setNewEra((current) => ({ ...current, dynasty_id: event.target.value }))}
                                    disabled={isCreatingEra}
                                >
                                    <option value=''>Nenhuma</option>
                                    {dynasties.map((dynasty) => (
                                        <option key={dynasty.id} value={dynasty.id}>{dynasty.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Tipo de governo
                                <select
                                    name='government_type_id'
                                    value={newEra.government_type_id}
                                    onChange={(event) => setNewEra((current) => ({ ...current, government_type_id: event.target.value }))}
                                    disabled={isCreatingEra}
                                >
                                    <option value=''>Nenhum</option>
                                    {governmentTypes.map((governmentType) => (
                                        <option key={governmentType.id} value={governmentType.id}>
                                            {governmentType.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <button className='countryViewerSubmitButton' type='submit' disabled={isCreatingEra}>
                            {isCreatingEra ? 'Criando...' : 'Criar era política'}
                        </button>
                        {createEraError && <p className='countryViewerError' role='alert'>{createEraError}</p>}
                        {createEraSuccess && <p className='countryViewerSuccess' role='status'>{createEraSuccess}</p>}
                    </form>
                    {politicalEras.length ? (
                        <div className='countryViewerEraList'>
                            {politicalEras.map((era, index) => (
                                <article className='countryViewerEra' key={era.id ?? `${era.start_date}-${index}`}>
                                    <h3>{era.name ?? `Era política ${index + 1}`}</h3>
                                    <p className='countryViewerEraPeriod'>
                                        {formatDateRange(era.start_date, era.end_date)}
                                    </p>
                                    <dl className='countryViewerDetails'>
                                        {era.full_name && (
                                            <div className='countryViewerDetail'>
                                                <dt>Nome oficial</dt>
                                                <dd>{era.full_name}</dd>
                                            </div>
                                        )}
                                        {era.full_name_local && (
                                            <div className='countryViewerDetail'>
                                                <dt>Nome oficial local</dt>
                                                <dd>{era.full_name_local}</dd>
                                            </div>
                                        )}
                                        <div className='countryViewerDetail'>
                                            <dt>País</dt>
                                            <dd>{countryName}{country.tag ? ` (${country.tag})` : ''}</dd>
                                        </div>
                                        {(era.dynasty?.name || dynastyNames[era.dynasty_id]) && (
                                            <div className='countryViewerDetail'>
                                                <dt>Dinastia</dt>
                                                <dd>{era.dynasty?.name ?? dynastyNames[era.dynasty_id]}</dd>
                                            </div>
                                        )}
                                        {era.government_type?.name && (
                                            <div className='countryViewerDetail'>
                                                <dt>Tipo de governo</dt>
                                                <dd>{era.government_type.name}</dd>
                                            </div>
                                        )}
                                    </dl>
                                    <div className='countryViewerEraLists'>
                                        <EraCarousel
                                            title='Governantes'
                                            items={sortRulersByReign(era.rulers ?? [])}
                                            renderSlide={(ruler) => {
                                                const rulerName = ruler.person?.name ?? 'Nome indisponível';
                                                const portrait = ruler.portrait
                                                    ?? ruler.image
                                                    ?? ruler.person?.portrait
                                                    ?? ruler.person?.image;
                                                return (
                                                    <div className='countryViewerCarouselCard'>
                                                        {portrait
                                                            ? <img className='countryViewerLeaderPortrait' src={portrait} alt={`Retrato de ${rulerName}`} />
                                                            : <div className='countryViewerImagePlaceholder'>Retrato indisponível</div>}
                                                        <strong>{rulerName}</strong>
                                                        <span>{formatDateRange(ruler.start, ruler.end)}</span>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <EraList
                                            title='Capitais'
                                            items={era.capitals ?? []}
                                            renderItem={(capital) => (
                                                <li key={capital.id ?? capital.name}>
                                                    <strong>{capital.name ?? capital}</strong>
                                                    {typeof capital === 'object' && (capital.start_date || capital.end_date) && (
                                                        <span> — {formatDateRange(capital.start_date, capital.end_date)}</span>
                                                    )}
                                                </li>
                                            )}
                                        />
                                        <EraCarousel
                                            title='Bandeiras'
                                            items={[...(era.flags ?? []), ...(era.flag ? [era.flag] : [])]}
                                            renderSlide={(flag) => {
                                                const image = getFlagImage(flag);
                                                return (
                                                    <div className='countryViewerCarouselCard'>
                                                        {image
                                                            ? <img className='countryViewerEraFlag' src={image} alt={`Bandeira de ${era.name ?? countryName}`} />
                                                            : <div className='countryViewerImagePlaceholder'>Bandeira indisponível</div>}
                                                        {typeof flag === 'object' && (flag.start_date || flag.end_date) && (
                                                            <span>{formatDateRange(flag.start_date, flag.end_date)}</span>
                                                        )}
                                                    </div>
                                                );
                                            }}
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p>Este país ainda não possui eras políticas cadastradas.</p>
                    )}
                </section>
            )}
        </main>
    );
}

export default CountryViewer;
