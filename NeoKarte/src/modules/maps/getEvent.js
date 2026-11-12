import apiClient from '../apiClient';

const eventsUrl = '/historical_events';

export async function getAllEvents() {
    try {
        const response = await apiClient.get(eventsUrl);
        return response.data;
    } catch (error) {
        console.error('Erro ao ler todos os eventos históricos: ', error);
        throw error;
    }
}

export async function createEvent(event) {
    try {
        const response = await apiClient.post(eventsUrl, { historical_event: event });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar evento histórico: ', error);
        throw error;
    }
}

export async function updateEvent(id, event) {
    try {
        const response = await apiClient.put(
            `${eventsUrl}/${encodeURIComponent(id)}`,
            { historical_event: event }
        );
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar evento histórico: ', error);
        throw error;
    }
}

export async function deleteEvent(id) {
    try {
        const response = await apiClient.delete(`${eventsUrl}/${encodeURIComponent(id)}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao excluir evento histórico: ', error);
        throw error;
    }
}