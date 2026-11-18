import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
    createCapital,
    createFlag,
    createPoliticalEra,
    createPortrait,
    createRuler,
    getAllDynasties,
    getAllGovernmentTypes,
    getAllPeople,
    getCountryById,
    getPoliticalEras,
    updateCapital,
    updateFlag,
    updatePoliticalEra,
    updatePortrait,
    updateRuler,
} from '../../modules/maps/getCountry';
import './countryViewer.css';

function getFlagImage(flag) {
    if (typeof flag === 'string') {
        return flag;
    }
    return flag?.image;
}

function getPortraitImage(portrait) {
    if (typeof portrait === 'string') {
        return portrait;
    }
    return portrait?.image;
}

function getRulerPortraitRecord(ruler) {
    return [
        ruler.portrait,
        ruler.image,
        ruler.person?.portrait,
        ruler.person?.image,
    ].find((portrait) => portrait && typeof portrait === 'object' && portrait.id != null);
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
    const capitalFormRef = useRef(null);
    const flagFormRef = useRef(null);
    const rulerFormRef = useRef(null);
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
    const [editingEraId, setEditingEraId] = useState(null);
    const [isCreatingEra, setIsCreatingEra] = useState(false);
    const [createEraError, setCreateEraError] = useState('');
    const [createEraSuccess, setCreateEraSuccess] = useState('');
    const [newFlag, setNewFlag] = useState({
        start_date: '',
        end_date: '',
        political_era_id: '',
        image: null,
    });
    const [editingFlagId, setEditingFlagId] = useState(null);
    const [editingFlagImage, setEditingFlagImage] = useState('');
    const [isCreatingFlag, setIsCreatingFlag] = useState(false);
    const [createFlagError, setCreateFlagError] = useState('');
    const [createFlagSuccess, setCreateFlagSuccess] = useState('');
    const [newCapital, setNewCapital] = useState({
        name: '',
        start_date: '',
        end_date: '',
        political_era_id: '',
        startdate_approximate: false,
        enddate_approximate: false,
    });
    const [editingCapitalId, setEditingCapitalId] = useState(null);
    const [isCreatingCapital, setIsCreatingCapital] = useState(false);
    const [createCapitalError, setCreateCapitalError] = useState('');
    const [createCapitalSuccess, setCreateCapitalSuccess] = useState('');
    const [people, setPeople] = useState([]);
    const [newRuler, setNewRuler] = useState({
        political_era_id: '',
        person_id: '',
        start: '',
        end: '',
        startdate_approximate: false,
        enddate_approximate: false,
        image: null,
    });
    const [editingRulerId, setEditingRulerId] = useState(null);
    const [editingPortraitId, setEditingPortraitId] = useState(null);
    const [editingPortraitImage, setEditingPortraitImage] = useState('');
    const [isCreatingRuler, setIsCreatingRuler] = useState(false);
    const [createRulerError, setCreateRulerError] = useState('');
    const [createRulerSuccess, setCreateRulerSuccess] = useState('');

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
                    const [erasResponse, dynastyResponse, governmentTypeResponse, peopleResponse] = await Promise.all([
                        getPoliticalEras(id),
                        getAllDynasties(),
                        getAllGovernmentTypes(),
                        getAllPeople(),
                    ]);
                    const eras = Array.isArray(erasResponse)
                        ? erasResponse
                        : erasResponse?.political_eras ?? erasResponse?.data;
                    const peopleData = Array.isArray(peopleResponse)
                        ? peopleResponse
                        : peopleResponse?.people ?? peopleResponse?.data;
                    if (!Array.isArray(eras)) {
                        throw new Error('A resposta do servidor não contém uma lista de eras políticas.');
                    }
                    if (!Array.isArray(dynastyResponse) || !Array.isArray(governmentTypeResponse)) {
                        throw new Error('Não foi possível carregar as opções de dinastia e tipo de governo.');
                    }
                    if (!Array.isArray(peopleData)) {
                        throw new Error('A resposta do servidor não contém uma lista de pessoas.');
                    }

                    if (isMounted) {
                        setPoliticalEras(eras);
                        setDynasties(dynastyResponse);
                        setGovernmentTypes(governmentTypeResponse);
                        setPeople(peopleData);
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
            if (editingEraId === null) {
                await createPoliticalEra(id, politicalEra);
                setCreateEraSuccess(`${politicalEra.name} foi criada com sucesso.`);
            } else {
                await updatePoliticalEra(editingEraId, politicalEra);
                setCreateEraSuccess(`${politicalEra.name} foi atualizada com sucesso.`);
            }
            resetEraForm();

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
                    `Era salva, mas não foi possível atualizar a lista: ${
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

    function handleEditPoliticalEra(era) {
        setEditingEraId(era.id);
        setNewEra({
            name: era.name ?? '',
            full_name: era.full_name ?? '',
            full_name_local: era.full_name_local ?? '',
            start_date: String(era.start_date ?? '').slice(0, 10),
            end_date: String(era.end_date ?? '').slice(0, 10),
            dynasty_id: era.dynasty_id == null ? '' : String(era.dynasty_id),
            government_type_id: era.government_type_id == null ? '' : String(era.government_type_id),
        });
        setCreateEraError('');
        setCreateEraSuccess('');
    }

    function resetEraForm() {
        setNewEra({
            name: '',
            full_name: '',
            full_name_local: '',
            start_date: '',
            end_date: '',
            dynasty_id: '',
            government_type_id: '',
        });
        setEditingEraId(null);
        setCreateEraError('');
    }

    async function handleCreateFlag(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const isEditing = editingFlagId !== null;
        setCreateFlagError('');
        setCreateFlagSuccess('');

        if (newFlag.end_date < newFlag.start_date) {
            setCreateFlagError('A data final deve ser igual ou posterior à data inicial.');
            return;
        }

        setIsCreatingFlag(true);
        try {
            const flag = {
                ...newFlag,
                political_era_id: String(newFlag.political_era_id),
            };
            if (isEditing) {
                await updateFlag(editingFlagId, flag);
            } else {
                await createFlag(flag);
            }
            setNewFlag({
                start_date: '',
                end_date: '',
                political_era_id: '',
                image: null,
            });
            setEditingFlagId(null);
            setEditingFlagImage('');
            form.reset();
            setCreateFlagSuccess(
                isEditing ? 'Bandeira atualizada com sucesso.' : 'Bandeira criada com sucesso.'
            );

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
                setCreateFlagError(
                    `Bandeira salva, mas não foi possível atualizar a lista: ${
                        refreshError instanceof Error ? refreshError.message : 'Erro desconhecido.'
                    }`
                );
            }
        } catch (createError) {
            const responseMessage = createError?.response?.data?.error
                ?? createError?.response?.data?.message;
            setCreateFlagError(
                responseMessage
                    ?? (createError instanceof Error ? createError.message : 'Erro desconhecido.')
            );
        } finally {
            setIsCreatingFlag(false);
        }
    }

    function handleEditFlag(flag, politicalEraId) {
        setEditingFlagId(flag.id);
        setEditingFlagImage(getFlagImage(flag) ?? '');
        setNewFlag({
            start_date: String(flag.start_date ?? '').slice(0, 10),
            end_date: String(flag.end_date ?? '').slice(0, 10),
            political_era_id: String(flag.political_era_id ?? politicalEraId),
            image: null,
        });
        setCreateFlagError('');
        setCreateFlagSuccess('');
        flagFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function resetFlagForm() {
        setNewFlag({
            start_date: '',
            end_date: '',
            political_era_id: '',
            image: null,
        });
        setEditingFlagId(null);
        setEditingFlagImage('');
        setCreateFlagError('');
        flagFormRef.current?.reset();
    }

    async function handleCreateCapital(event) {
        event.preventDefault();
        const isEditing = editingCapitalId !== null;
        setCreateCapitalError('');
        setCreateCapitalSuccess('');

        if (newCapital.end_date < newCapital.start_date) {
            setCreateCapitalError('A data final deve ser igual ou posterior à data inicial.');
            return;
        }

        const capital = {
            name: newCapital.name.trim(),
            start_date: newCapital.start_date,
            end_date: newCapital.end_date,
            political_era_id: Number(newCapital.political_era_id),
            startdate_approximate: newCapital.startdate_approximate,
            enddate_approximate: newCapital.enddate_approximate,
        };

        setIsCreatingCapital(true);
        try {
            if (isEditing) {
                await updateCapital(editingCapitalId, capital);
            } else {
                await createCapital(capital);
            }
            setNewCapital({
                name: '',
                start_date: '',
                end_date: '',
                political_era_id: '',
                startdate_approximate: false,
                enddate_approximate: false,
            });
            setEditingCapitalId(null);
            setCreateCapitalSuccess(
                isEditing
                    ? `${capital.name} foi atualizada com sucesso.`
                    : `${capital.name} foi cadastrada com sucesso.`
            );

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
                setCreateCapitalError(
                    `Capital salva, mas não foi possível atualizar a lista: ${
                        refreshError instanceof Error ? refreshError.message : 'Erro desconhecido.'
                    }`
                );
            }
        } catch (createError) {
            const responseMessage = createError?.response?.data?.error
                ?? createError?.response?.data?.message;
            setCreateCapitalError(
                responseMessage
                    ?? (createError instanceof Error ? createError.message : 'Erro desconhecido.')
            );
        } finally {
            setIsCreatingCapital(false);
        }
    }

    function handleEditCapital(capital, politicalEraId) {
        setEditingCapitalId(capital.id);
        setNewCapital({
            name: capital.name ?? '',
            start_date: String(capital.start_date ?? '').slice(0, 10),
            end_date: String(capital.end_date ?? '').slice(0, 10),
            political_era_id: String(capital.political_era_id ?? politicalEraId),
            startdate_approximate: Boolean(capital.startdate_approximate),
            enddate_approximate: Boolean(capital.enddate_approximate),
        });
        setCreateCapitalError('');
        setCreateCapitalSuccess('');
        capitalFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function resetCapitalForm() {
        setNewCapital({
            name: '',
            start_date: '',
            end_date: '',
            political_era_id: '',
            startdate_approximate: false,
            enddate_approximate: false,
        });
        setEditingCapitalId(null);
        setCreateCapitalError('');
    }

    async function handleCreateRuler(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const isEditing = editingRulerId !== null;
        setCreateRulerError('');
        setCreateRulerSuccess('');

        if (newRuler.end < newRuler.start) {
            setCreateRulerError('A data final deve ser igual ou posterior à data inicial.');
            return;
        }

        const ruler = {
            political_era_id: Number(newRuler.political_era_id),
            person_id: Number(newRuler.person_id),
            start: newRuler.start,
            end: newRuler.end,
            startdate_approximate: newRuler.startdate_approximate,
            enddate_approximate: newRuler.enddate_approximate,
        };
        const selectedPerson = people.find((person) => String(person.id) === newRuler.person_id);

        setIsCreatingRuler(true);
        try {
            const rulerResponse = isEditing
                ? await updateRuler(editingRulerId, ruler)
                : await createRuler(ruler);
            const createdRuler = rulerResponse?.ruler ?? rulerResponse;
            let portraitError = '';

            if (newRuler.image) {
                const rulerId = editingRulerId ?? createdRuler?.id;
                if (rulerId == null) {
                    portraitError = 'O líder foi salvo, mas o servidor não retornou o ID necessário para associar o retrato.';
                } else {
                    try {
                        const portrait = {
                            ruler_id: String(rulerId),
                            image: newRuler.image,
                        };
                        if (isEditing && editingPortraitId !== null) {
                            await updatePortrait(editingPortraitId, portrait);
                        } else {
                            await createPortrait(portrait);
                        }
                    } catch (uploadError) {
                        const responseMessage = uploadError?.response?.data?.error
                            ?? uploadError?.response?.data?.message;
                        portraitError = `O líder foi salvo, mas não foi possível salvar o retrato: ${
                            responseMessage
                                ?? (uploadError instanceof Error ? uploadError.message : 'Erro desconhecido.')
                        }`;
                    }
                }
            }

            setNewRuler({
                political_era_id: '',
                person_id: '',
                start: '',
                end: '',
                startdate_approximate: false,
                enddate_approximate: false,
                image: null,
            });
            setEditingRulerId(null);
            setEditingPortraitId(null);
            setEditingPortraitImage('');
            form.reset();
            setCreateRulerSuccess(
                `${selectedPerson?.name ?? 'Líder'} foi ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso.${newRuler.image && !portraitError ? ' Retrato enviado.' : ''}`
            );
            setCreateRulerError(portraitError);

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
                const message = refreshError instanceof Error ? refreshError.message : 'Erro desconhecido.';
                setCreateRulerError((currentError) => [
                    currentError,
                    `Líder salvo, mas não foi possível atualizar a lista: ${message}`,
                ].filter(Boolean).join(' '));
            }
        } catch (createError) {
            const responseMessage = createError?.response?.data?.error
                ?? createError?.response?.data?.message;
            setCreateRulerError(
                responseMessage
                    ?? (createError instanceof Error ? createError.message : 'Erro desconhecido.')
            );
        } finally {
            setIsCreatingRuler(false);
        }
    }

    function handleEditRuler(ruler, politicalEraId) {
        const portraitRecord = getRulerPortraitRecord(ruler);
        const portraitImage = getPortraitImage(ruler.portrait)
            ?? getPortraitImage(ruler.image)
            ?? getPortraitImage(ruler.person?.portrait)
            ?? getPortraitImage(ruler.person?.image)
            ?? '';
        setEditingRulerId(ruler.id);
        setEditingPortraitId(portraitRecord?.id ?? ruler.portrait_id ?? null);
        setEditingPortraitImage(portraitImage);
        setNewRuler({
            political_era_id: String(ruler.political_era_id ?? politicalEraId),
            person_id: String(ruler.person_id ?? ruler.person?.id ?? ''),
            start: String(ruler.start ?? ruler.start_date ?? '').slice(0, 10),
            end: String(ruler.end ?? ruler.end_date ?? '').slice(0, 10),
            startdate_approximate: Boolean(ruler.startdate_approximate),
            enddate_approximate: Boolean(ruler.enddate_approximate),
            image: null,
        });
        setCreateRulerError('');
        setCreateRulerSuccess('');
        rulerFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function resetRulerForm() {
        setNewRuler({
            political_era_id: '',
            person_id: '',
            start: '',
            end: '',
            startdate_approximate: false,
            enddate_approximate: false,
            image: null,
        });
        setEditingRulerId(null);
        setEditingPortraitId(null);
        setEditingPortraitImage('');
        setCreateRulerError('');
        rulerFormRef.current?.reset();
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
                        <h3>{editingEraId === null ? 'Criar era política' : 'Editar era política'}</h3>
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
                            {isCreatingEra
                                ? editingEraId === null ? 'Criando...' : 'Salvando...'
                                : editingEraId === null ? 'Criar era política' : 'Salvar alterações'}
                        </button>
                        {editingEraId !== null && (
                            <button
                                className='countryViewerCancelButton'
                                type='button'
                                onClick={resetEraForm}
                                disabled={isCreatingEra}
                            >
                                Cancelar edição
                            </button>
                        )}
                        {createEraError && <p className='countryViewerError' role='alert'>{createEraError}</p>}
                        {createEraSuccess && <p className='countryViewerSuccess' role='status'>{createEraSuccess}</p>}
                    </form>
                    <form ref={capitalFormRef} className='countryViewerEraForm' onSubmit={handleCreateCapital}>
                        <h3>{editingCapitalId === null ? 'Cadastrar capital' : 'Editar capital'}</h3>
                        <div className='countryViewerEraFormGrid'>
                            <label>
                                Era política *
                                <select
                                    name='capital[political_era_id]'
                                    value={newCapital.political_era_id}
                                    onChange={(event) => setNewCapital((current) => ({
                                        ...current,
                                        political_era_id: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingCapital || politicalEras.length === 0}
                                >
                                    <option value=''>Selecione uma era política</option>
                                    {politicalEras.map((era) => (
                                        <option key={era.id} value={era.id}>{era.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Nome *
                                <input
                                    type='text'
                                    name='capital[name]'
                                    value={newCapital.name}
                                    onChange={(event) => setNewCapital((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingCapital}
                                />
                            </label>
                            <label>
                                Data de início *
                                <input
                                    type='date'
                                    name='capital[start_date]'
                                    value={newCapital.start_date}
                                    onChange={(event) => setNewCapital((current) => ({
                                        ...current,
                                        start_date: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingCapital}
                                />
                            </label>
                            <label>
                                Data de fim *
                                <input
                                    type='date'
                                    name='capital[end_date]'
                                    value={newCapital.end_date}
                                    onChange={(event) => setNewCapital((current) => ({
                                        ...current,
                                        end_date: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingCapital}
                                />
                            </label>
                            <label className='countryViewerCheckboxLabel'>
                                <input
                                    type='checkbox'
                                    name='capital[startdate_approximate]'
                                    checked={newCapital.startdate_approximate}
                                    onChange={(event) => setNewCapital((current) => ({
                                        ...current,
                                        startdate_approximate: event.target.checked,
                                    }))}
                                    disabled={isCreatingCapital}
                                />
                                Data de início aproximada
                            </label>
                            <label className='countryViewerCheckboxLabel'>
                                <input
                                    type='checkbox'
                                    name='capital[enddate_approximate]'
                                    checked={newCapital.enddate_approximate}
                                    onChange={(event) => setNewCapital((current) => ({
                                        ...current,
                                        enddate_approximate: event.target.checked,
                                    }))}
                                    disabled={isCreatingCapital}
                                />
                                Data de fim aproximada
                            </label>
                        </div>
                        <button
                            className='countryViewerSubmitButton'
                            type='submit'
                            disabled={isCreatingCapital || politicalEras.length === 0}
                        >
                            {isCreatingCapital
                                ? 'Salvando...'
                                : editingCapitalId === null ? 'Cadastrar capital' : 'Salvar alterações'}
                        </button>
                        {editingCapitalId !== null && (
                            <button
                                className='countryViewerCancelButton'
                                type='button'
                                onClick={resetCapitalForm}
                                disabled={isCreatingCapital}
                            >
                                Cancelar edição
                            </button>
                        )}
                        {politicalEras.length === 0 && (
                            <p>Crie uma era política antes de cadastrar uma capital.</p>
                        )}
                        {createCapitalError && <p className='countryViewerError' role='alert'>{createCapitalError}</p>}
                        {createCapitalSuccess && <p className='countryViewerSuccess' role='status'>{createCapitalSuccess}</p>}
                    </form>
                    <form ref={rulerFormRef} className='countryViewerEraForm' onSubmit={handleCreateRuler}>
                        <h3>{editingRulerId === null ? 'Cadastrar líder' : 'Editar líder'}</h3>
                        <div className='countryViewerEraFormGrid'>
                            <label>
                                Era política *
                                <select
                                    name='ruler[political_era_id]'
                                    value={newRuler.political_era_id}
                                    onChange={(event) => setNewRuler((current) => ({
                                        ...current,
                                        political_era_id: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingRuler || politicalEras.length === 0}
                                >
                                    <option value=''>Selecione uma era política</option>
                                    {politicalEras.map((era) => (
                                        <option key={era.id} value={era.id}>
                                            {era.name ?? `Era política ${era.id}`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Pessoa *
                                <select
                                    name='ruler[person_id]'
                                    value={newRuler.person_id}
                                    onChange={(event) => setNewRuler((current) => ({
                                        ...current,
                                        person_id: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingRuler || people.length === 0}
                                >
                                    <option value=''>Selecione uma pessoa</option>
                                    {people.map((person) => (
                                        <option key={person.id} value={person.id}>{person.name}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Data de início *
                                <input
                                    type='date'
                                    name='ruler[start]'
                                    value={newRuler.start}
                                    onChange={(event) => setNewRuler((current) => ({
                                        ...current,
                                        start: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingRuler}
                                />
                            </label>
                            <label>
                                Data de fim *
                                <input
                                    type='date'
                                    name='ruler[end]'
                                    value={newRuler.end}
                                    onChange={(event) => setNewRuler((current) => ({
                                        ...current,
                                        end: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingRuler}
                                />
                            </label>
                            <label className='countryViewerCheckboxLabel'>
                                <input
                                    type='checkbox'
                                    name='ruler[startdate_approximate]'
                                    checked={newRuler.startdate_approximate}
                                    onChange={(event) => setNewRuler((current) => ({
                                        ...current,
                                        startdate_approximate: event.target.checked,
                                    }))}
                                    disabled={isCreatingRuler}
                                />
                                Data de início aproximada
                            </label>
                            <label className='countryViewerCheckboxLabel'>
                                <input
                                    type='checkbox'
                                    name='ruler[enddate_approximate]'
                                    checked={newRuler.enddate_approximate}
                                    onChange={(event) => setNewRuler((current) => ({
                                        ...current,
                                        enddate_approximate: event.target.checked,
                                    }))}
                                    disabled={isCreatingRuler}
                                />
                                Data de fim aproximada
                            </label>
                            <label>
                                Retrato {editingRulerId === null ? '' : '(opcional para substituir)'}
                                <input
                                    type='file'
                                    name='portrait[image]'
                                    accept='image/*'
                                    onChange={(event) => setNewRuler((current) => ({
                                        ...current,
                                        image: event.target.files?.[0] ?? null,
                                    }))}
                                    disabled={isCreatingRuler}
                                />
                            </label>
                        </div>
                        {editingPortraitImage && (
                            <div className='countryViewerImageEditPreview'>
                                <span>Retrato atual</span>
                                <img
                                    className='countryViewerLeaderPortrait'
                                    src={editingPortraitImage}
                                    alt='Retrato atual do líder'
                                />
                            </div>
                        )}
                        {newRuler.image && <p>Nova imagem selecionada: {newRuler.image.name}</p>}
                        <button
                            className='countryViewerSubmitButton'
                            type='submit'
                            disabled={isCreatingRuler || politicalEras.length === 0 || people.length === 0}
                        >
                            {isCreatingRuler
                                ? 'Salvando...'
                                : editingRulerId === null ? 'Cadastrar líder' : 'Salvar alterações'}
                        </button>
                        {editingRulerId !== null && (
                            <button
                                className='countryViewerCancelButton'
                                type='button'
                                onClick={resetRulerForm}
                                disabled={isCreatingRuler}
                            >
                                Cancelar edição
                            </button>
                        )}
                        {politicalEras.length === 0 && (
                            <p>Crie uma era política antes de cadastrar um líder.</p>
                        )}
                        {people.length === 0 && (
                            <p>Cadastre uma pessoa antes de criar um líder.</p>
                        )}
                        {createRulerError && <p className='countryViewerError' role='alert'>{createRulerError}</p>}
                        {createRulerSuccess && <p className='countryViewerSuccess' role='status'>{createRulerSuccess}</p>}
                    </form>
                    <form ref={flagFormRef} className='countryViewerEraForm' onSubmit={handleCreateFlag}>
                        <h3>{editingFlagId === null ? 'Criar bandeira' : 'Editar bandeira'}</h3>
                        <div className='countryViewerEraFormGrid'>
                            <label>
                                Era política *
                                <select
                                    name='flag[political_era_id]'
                                    value={newFlag.political_era_id}
                                    onChange={(event) => setNewFlag((current) => ({
                                        ...current,
                                        political_era_id: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingFlag || politicalEras.length === 0}
                                >
                                    <option value=''>Selecione uma era política</option>
                                    {politicalEras.map((era) => (
                                        <option key={era.id} value={era.id}>
                                            {era.name ?? `Era política ${era.id}`}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Data inicial *
                                <input
                                    type='date'
                                    name='flag[start_date]'
                                    value={newFlag.start_date}
                                    onChange={(event) => setNewFlag((current) => ({
                                        ...current,
                                        start_date: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingFlag}
                                />
                            </label>
                            <label>
                                Data final *
                                <input
                                    type='date'
                                    name='flag[end_date]'
                                    value={newFlag.end_date}
                                    onChange={(event) => setNewFlag((current) => ({
                                        ...current,
                                        end_date: event.target.value,
                                    }))}
                                    required
                                    disabled={isCreatingFlag}
                                />
                            </label>
                            <label>
                                Imagem {editingFlagId === null ? '*' : '(opcional para substituir)'}
                                <input
                                    type='file'
                                    name='flag[image]'
                                    accept='image/*'
                                    onChange={(event) => setNewFlag((current) => ({
                                        ...current,
                                        image: event.target.files?.[0] ?? null,
                                    }))}
                                    required={editingFlagId === null}
                                    disabled={isCreatingFlag}
                                />
                            </label>
                        </div>
                        {editingFlagImage && (
                            <div className='countryViewerImageEditPreview'>
                                <span>Bandeira atual</span>
                                <img
                                    className='countryViewerEraFlag'
                                    src={editingFlagImage}
                                    alt='Bandeira atual'
                                />
                            </div>
                        )}
                        {newFlag.image && <p>Nova imagem selecionada: {newFlag.image.name}</p>}
                        <button
                            className='countryViewerSubmitButton'
                            type='submit'
                            disabled={isCreatingFlag || politicalEras.length === 0}
                        >
                            {isCreatingFlag
                                ? 'Salvando...'
                                : editingFlagId === null ? 'Criar bandeira' : 'Salvar alterações'}
                        </button>
                        {editingFlagId !== null && (
                            <button
                                className='countryViewerCancelButton'
                                type='button'
                                onClick={resetFlagForm}
                                disabled={isCreatingFlag}
                            >
                                Cancelar edição
                            </button>
                        )}
                        {politicalEras.length === 0 && (
                            <p>Crie uma era política antes de cadastrar uma bandeira.</p>
                        )}
                        {createFlagError && <p className='countryViewerError' role='alert'>{createFlagError}</p>}
                        {createFlagSuccess && <p className='countryViewerSuccess' role='status'>{createFlagSuccess}</p>}
                    </form>
                    {politicalEras.length ? (
                        <div className='countryViewerEraList'>
                            {politicalEras.map((era, index) => (
                                <article className='countryViewerEra' key={era.id ?? `${era.start_date}-${index}`}>
                                    <h3>{era.name ?? `Era política ${index + 1}`}</h3>
                                    <button
                                        className='countryViewerSubmitButton'
                                        type='button'
                                        onClick={() => handleEditPoliticalEra(era)}
                                        disabled={isCreatingEra}
                                    >
                                        Editar era
                                    </button>
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
                                                const portrait = getPortraitImage(ruler.portrait)
                                                    ?? getPortraitImage(ruler.image)
                                                    ?? getPortraitImage(ruler.person?.portrait)
                                                    ?? getPortraitImage(ruler.person?.image);
                                                return (
                                                    <div className='countryViewerCarouselCard'>
                                                        {portrait
                                                            ? <img className='countryViewerLeaderPortrait' src={portrait} alt={`Retrato de ${rulerName}`} />
                                                            : <div className='countryViewerImagePlaceholder'>Retrato indisponível</div>}
                                                        <strong>{rulerName}</strong>
                                                        <span>{formatDateRange(ruler.start, ruler.end)}</span>
                                                        {ruler.id != null && (
                                                            <button
                                                                className='countryViewerItemEditButton'
                                                                type='button'
                                                                onClick={() => handleEditRuler(ruler, era.id)}
                                                                disabled={isCreatingRuler}
                                                            >
                                                                Editar líder
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            }}
                                        />
                                        <EraList
                                            title='Capitais'
                                            items={era.capitals ?? []}
                                            renderItem={(capital) => {
                                                const hasId = typeof capital === 'object' && capital?.id != null;
                                                return (
                                                    <li key={capital.id ?? capital.name}>
                                                        <strong>{capital.name ?? capital}</strong>
                                                        {typeof capital === 'object' && (capital.start_date || capital.end_date) && (
                                                            <span> — {formatDateRange(capital.start_date, capital.end_date)}</span>
                                                        )}
                                                        {hasId && (
                                                            <button
                                                                className='countryViewerItemEditButton'
                                                                type='button'
                                                                onClick={() => handleEditCapital(capital, era.id)}
                                                                disabled={isCreatingCapital}
                                                            >
                                                                Editar capital
                                                            </button>
                                                        )}
                                                    </li>
                                                );
                                            }}
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
                                                        {typeof flag === 'object' && flag?.id != null && (
                                                            <button
                                                                className='countryViewerItemEditButton'
                                                                type='button'
                                                                onClick={() => handleEditFlag(flag, era.id)}
                                                                disabled={isCreatingFlag}
                                                            >
                                                                Editar bandeira
                                                            </button>
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
