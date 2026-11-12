import { useEffect, useState } from 'react';
import {
    createEvent,
    deleteEvent,
    getAllEvents,
    updateEvent,
} from '../../modules/maps/getEvent';
import maps from '../../modules/maps/mapLoader';
import { calculateRelativeDistance } from '../../modules/maps/renderEvent';
import './eventManager.css';

const MapPreview = maps['../../assets/maps/1444.svg'];
const LATITUDE_RANGE = { min: 30, max: 75 };
const LONGITUDE_RANGE = { min: -30, max: 50 };

const emptyEvent = {
    name: '',
    location: '',
    latitude: '50',
    longitude: '10',
    start_date: '',
    end_date: '',
    startdate_approximate: false,
    enddate_approximate: false,
};

function getErrorMessage(error) {
    return error?.response?.data?.error
        ?? error?.response?.data?.message
        ?? (error instanceof Error ? error.message : 'Erro desconhecido.');
}

function getEventData(response) {
    return Array.isArray(response) ? response : response?.historical_events ?? response?.data;
}

function EventManager() {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [eventForm, setEventForm] = useState(emptyEvent);
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function loadEvents() {
            try {
                const data = getEventData(await getAllEvents());
                if (!Array.isArray(data)) {
                    throw new Error('A resposta do servidor não contém uma lista de eventos.');
                }
                if (isMounted) setEvents(data);
            } catch (loadError) {
                if (isMounted) setError(getErrorMessage(loadError));
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        loadEvents();
        return () => {
            isMounted = false;
        };
    }, []);

    const normalizedSearch = search.trim().toLocaleLowerCase();
    const filteredEvents = events.filter((event) =>
        [event.name, event.location, event.start_date, event.end_date]
            .some((value) => String(value ?? '').toLocaleLowerCase().includes(normalizedSearch))
    );
    const previewPosition = calculateRelativeDistance(
        eventForm.latitude,
        eventForm.longitude
    );

    function handleFormChange(event) {
        const { name, value, checked, type } = event.target;
        setEventForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }

    function handleCoordinateSliderChange(event) {
        const { name, value } = event.target;
        setEventForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleEdit(event) {
        setEditingId(event.id);
        setEventForm({
            name: event.name ?? '',
            location: event.location ?? '',
            latitude: event.latitude ?? '',
            longitude: event.longitude ?? '',
            start_date: event.start_date ?? '',
            end_date: event.end_date ?? '',
            startdate_approximate: Boolean(event.startdate_approximate),
            enddate_approximate: Boolean(event.enddate_approximate),
        });
        setFormError('');
        setSuccess('');
    }

    function resetForm() {
        setEventForm(emptyEvent);
        setEditingId(null);
        setFormError('');
    }

    async function refreshEvents() {
        const data = getEventData(await getAllEvents());
        if (!Array.isArray(data)) {
            throw new Error('A resposta do servidor não contém uma lista de eventos.');
        }
        setEvents(data);
        setError('');
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError('');
        setSuccess('');

        const eventData = {
            name: eventForm.name.trim(),
            location: eventForm.location.trim(),
            latitude: Number(eventForm.latitude),
            longitude: Number(eventForm.longitude),
            start_date: eventForm.start_date || null,
            end_date: eventForm.end_date || null,
            startdate_approximate: eventForm.startdate_approximate,
            enddate_approximate: eventForm.enddate_approximate,
        };

        if (!eventData.name || !eventData.location) {
            setFormError('Nome e local são obrigatórios.');
            return;
        }
        if (
            eventForm.latitude === '' ||
            eventForm.longitude === '' ||
            !Number.isFinite(eventData.latitude) ||
            eventData.latitude < -90 ||
            eventData.latitude > 90 ||
            !Number.isFinite(eventData.longitude) ||
            eventData.longitude < -180 ||
            eventData.longitude > 180
        ) {
            setFormError('Informe latitude entre -90 e 90 e longitude entre -180 e 180.');
            return;
        }
        if (eventData.start_date && eventData.end_date && eventData.end_date < eventData.start_date) {
            setFormError('A data final deve ser igual ou posterior à data inicial.');
            return;
        }

        setIsSaving(true);
        try {
            if (editingId === null) {
                await createEvent(eventData);
                setSuccess('Evento criado com sucesso.');
            } else {
                await updateEvent(editingId, eventData);
                setSuccess('Evento atualizado com sucesso.');
            }
            resetForm();
            try {
                await refreshEvents();
            } catch (refreshError) {
                setFormError(`Evento salvo, mas a lista não foi atualizada: ${getErrorMessage(refreshError)}`);
            }
        } catch (saveError) {
            setFormError(getErrorMessage(saveError));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(event) {
        if (!window.confirm(`Deseja excluir o evento "${event.name}"?`)) return;

        setDeletingId(event.id);
        setError('');
        setSuccess('');
        try {
            await deleteEvent(event.id);
            setSuccess('Evento excluído com sucesso.');
            if (editingId === event.id) resetForm();
            try {
                await refreshEvents();
            } catch (refreshError) {
                setError(`Evento excluído, mas a lista não foi atualizada: ${getErrorMessage(refreshError)}`);
            }
        } catch (deleteError) {
            setError(`Não foi possível excluir o evento: ${getErrorMessage(deleteError)}`);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <main className="eventManagerMain">
            <h1 className="eventManagerTitle">Gerenciador de eventos</h1>
            <div className="eventManagerContent">
                <section className="eventManagerListPanel" aria-label="Eventos cadastrados">
                    <form className="eventManagerSearch" onSubmit={(event) => event.preventDefault()}>
                        <label htmlFor="eventSearch">Buscar evento</label>
                        <input
                            id="eventSearch"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Nome, local ou data"
                        />
                    </form>
                    {isLoading && <p role="status">Carregando eventos...</p>}
                    {error && <p className="eventManagerError" role="alert">{error}</p>}
                    {!isLoading && !error && (
                        <ul className="eventManagerList" aria-live="polite">
                            {filteredEvents.map((event) => (
                                <li className="eventManagerItem" key={event.id}>
                                    <div className="eventManagerInfo">
                                        <strong>{event.name}</strong>
                                        <span>{event.location} · {event.start_date || 'Data não informada'}</span>
                                        <span>
                                            {event.latitude}, {event.longitude}
                                            {event.end_date ? ` · até ${event.end_date}` : ''}
                                        </span>
                                    </div>
                                    <div className="eventManagerActions">
                                        <button
                                            className="eventManagerButton"
                                            type="button"
                                            onClick={() => handleEdit(event)}
                                            disabled={deletingId !== null}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="eventManagerButton eventManagerDeleteButton"
                                            type="button"
                                            onClick={() => handleDelete(event)}
                                            disabled={deletingId !== null}
                                        >
                                            {deletingId === event.id ? 'Excluindo...' : 'Excluir'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {filteredEvents.length === 0 && (
                                <li className="eventManagerEmpty">Nenhum evento encontrado.</li>
                            )}
                        </ul>
                    )}
                </section>

                <section className="eventManagerFormPanel">
                    <h2>{editingId === null ? 'Cadastrar evento' : 'Editar evento'}</h2>
                    <form className="eventManagerForm" onSubmit={handleSubmit}>
                        <label htmlFor="eventName">Nome</label>
                        <input id="eventName" name="name" value={eventForm.name} onChange={handleFormChange} required disabled={isSaving} />

                        <label htmlFor="eventLocation">Local</label>
                        <input id="eventLocation" name="location" value={eventForm.location} onChange={handleFormChange} required disabled={isSaving} />

                        {MapPreview && (
                            <div className="eventManagerMapPreview" aria-label="Prévia da posição do evento no mapa">
                                <MapPreview />
                                {previewPosition && (
                                    <span
                                        className="eventManagerMapMarker"
                                        aria-hidden="true"
                                        style={{
                                            left: `${previewPosition.x}%`,
                                            top: `${previewPosition.y}%`,
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        <div className="eventManagerCoordinates">
                            <div>
                                <label htmlFor="eventLatitude">Latitude</label>
                                <input id="eventLatitude" name="latitude" type="number" step="any" min="-90" max="90" value={eventForm.latitude} onChange={handleFormChange} required disabled={isSaving} />
                                <input
                                    aria-label="Ajustar latitude do evento"
                                    name="latitude"
                                    type="range"
                                    min={LATITUDE_RANGE.min}
                                    max={LATITUDE_RANGE.max}
                                    step="0.01"
                                    value={eventForm.latitude}
                                    onChange={handleCoordinateSliderChange}
                                    disabled={isSaving}
                                />
                                <output htmlFor="eventLatitude">{Number(eventForm.latitude).toFixed(2)}°</output>
                            </div>
                            <div>
                                <label htmlFor="eventLongitude">Longitude</label>
                                <input id="eventLongitude" name="longitude" type="number" step="any" min="-180" max="180" value={eventForm.longitude} onChange={handleFormChange} required disabled={isSaving} />
                                <input
                                    aria-label="Ajustar longitude do evento"
                                    name="longitude"
                                    type="range"
                                    min={LONGITUDE_RANGE.min}
                                    max={LONGITUDE_RANGE.max}
                                    step="0.01"
                                    value={eventForm.longitude}
                                    onChange={handleCoordinateSliderChange}
                                    disabled={isSaving}
                                />
                                <output htmlFor="eventLongitude">{Number(eventForm.longitude).toFixed(2)}°</output>
                            </div>
                        </div>

                        <label htmlFor="eventStartDate">Data inicial</label>
                        <input id="eventStartDate" name="start_date" type="date" value={eventForm.start_date} onChange={handleFormChange} disabled={isSaving} />
                        <label className="eventManagerCheckbox">
                            <input name="startdate_approximate" type="checkbox" checked={eventForm.startdate_approximate} onChange={handleFormChange} disabled={isSaving} />
                            Data inicial aproximada
                        </label>

                        <label htmlFor="eventEndDate">Data final</label>
                        <input id="eventEndDate" name="end_date" type="date" value={eventForm.end_date} onChange={handleFormChange} disabled={isSaving} />
                        <label className="eventManagerCheckbox">
                            <input name="enddate_approximate" type="checkbox" checked={eventForm.enddate_approximate} onChange={handleFormChange} disabled={isSaving} />
                            Data final aproximada
                        </label>

                        <div className="eventManagerFormActions">
                            <button className="eventManagerButton" type="submit" disabled={isSaving}>
                                {isSaving ? 'Salvando...' : editingId === null ? 'Criar evento' : 'Salvar alterações'}
                            </button>
                            {editingId !== null && (
                                <button className="eventManagerCancelButton" type="button" onClick={resetForm} disabled={isSaving}>
                                    Cancelar edição
                                </button>
                            )}
                        </div>
                        {formError && <p className="eventManagerError" role="alert">{formError}</p>}
                        {success && <p className="eventManagerSuccess" role="status">{success}</p>}
                    </form>
                </section>
            </div>
        </main>
    );
}

export default EventManager;
