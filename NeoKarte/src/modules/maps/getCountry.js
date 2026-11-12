import apiClient from '../apiClient';

export async function getAllCountries() {

    try {
        const response = await apiClient.get('/countries');
        const data = response.data;

        return data;
    } catch (e) {
        console.error('Erro ao ler todos os países: ', e);
        throw e;
    }
}

export async function createCountry(country) {
    try {
        const response = await apiClient.post('/countries', { country });
        return response.data;
    } catch (e) {
        console.error('Erro ao criar país: ', e);
        throw e;
    }
}

export async function getCountryById(id) {
    try {
        const response = await apiClient.get(`/countries/${encodeURIComponent(id)}`);
        const data = response.data;

        return data;
    } catch (e) {
        console.error('Erro ao ler país: ', e);
        throw e;
    }
}

export async function getCountryByTag(tag) {
    return getCountryById(tag);
}

export async function getPoliticalEras(countryId) {
    try {
        const response = await apiClient.get(
            `/countries/${encodeURIComponent(countryId)}/political_eras`
        );
        return response.data;
    } catch (e) {
        console.error('Erro ao ler eras políticas do país: ', e);
        throw e;
    }
}

export async function getAllDynasties() {
    try {
        const response = await apiClient.get('/dynasties');
        return response.data;
    } catch (e) {
        console.error('Erro ao ler dinastias: ', e);
        throw e;
    }
}

export async function getAllGovernmentTypes() {
    try {
        const response = await apiClient.get('/government_types');
        return response.data;
    } catch (e) {
        console.error('Erro ao ler tipos de governo: ', e);
        throw e;
    }
}

export async function createPoliticalEra(countryId, politicalEra) {
    try {
        const response = await apiClient.post(
            '/political_eras',
            {
                political_era: {
                    ...politicalEra,
                    country_id: countryId,
                },
            }
        );
        return response.data;
    } catch (e) {
        console.error('Erro ao criar era política: ', e);
        throw e;
    }
}

export async function createFlag(flag) {
    try {
        const formData = new FormData();
        formData.append('flag[start_date]', flag.start_date);
        formData.append('flag[end_date]', flag.end_date);
        formData.append('flag[political_era_id]', flag.political_era_id);
        formData.append('flag[image]', flag.image);

        const response = await apiClient.post('/flags', formData);
        return response.data;
    } catch (e) {
        console.error('Erro ao criar bandeira: ', e);
        throw e;
    }
}

export async function createCapital(capital) {
    try {
        const response = await apiClient.post('/capitals', { capital });
        return response.data;
    } catch (e) {
        console.error('Erro ao criar capital: ', e);
        throw e;
    }
}

export async function createRuler(ruler) {
    try {
        const response = await apiClient.post('/rulers', { ruler });
        return response.data;
    } catch (e) {
        console.error('Erro ao criar líder: ', e);
        throw e;
    }
}

export async function createPortrait(portrait) {
    try {
        const formData = new FormData();
        formData.append('portrait[ruler_id]', portrait.ruler_id);
        formData.append('portrait[image]', portrait.image);

        const response = await apiClient.post('/portraits', formData);
        return response.data;
    } catch (e) {
        console.error('Erro ao criar retrato: ', e);
        throw e;
    }
}

export async function getAllPeople() {
    try {
        const response = await apiClient.get('/people');
        return response.data;
    } catch (e) {
        console.error('Erro ao ler todas as pessoas: ', e);
        throw e;
    }
}

export async function createPerson(person) {
    try {
        const response = await apiClient.post('/people', { person });
        return response.data;
    } catch (e) {
        console.error('Erro ao criar pessoa: ', e);
        throw e;
    }
}

export async function getDynastyById(id) {
    try {
        const response = await apiClient.get(`/dynasties/${encodeURIComponent(id)}`);
        return response.data;
    } catch (e) {
        console.error('Erro ao ler dinastia: ', e);
        throw e;
    }
}

export async function getPoliticalEra(tag, date) {
    try {
        const countries = await getAllCountries();
        const country = countries?.find((item) => item.tag === tag);

        if (!country) {
            console.error('País não encontrado para o tag: ', tag);
            return;
        }

        const response = await apiClient.get(`/countries/${country.id}/political_eras/show_by_year`, {
            params: { selected_date: date }
        });
        const data = response.data;

        return data;
    } catch (e) {
        console.error('Erro ao ler informações do país: ', e);
    }
}