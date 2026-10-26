import axios from 'axios';

export async function getAllCountries() {

    try {
        const response = await axios.get('http://localhost:3000/countries');
        const data = response.data;

        return data;
    } catch (e) {
        console.error('Erro ao ler todos os países: ', e);
        throw e;
    }
}

export async function createCountry(country) {
    try {
        const response = await axios.post('http://localhost:3000/countries', { country });
        return response.data;
    } catch (e) {
        console.error('Erro ao criar país: ', e);
        throw e;
    }
}

export async function getCountryById(id) {
    try {
        const response = await axios.get(`http://localhost:3000/countries/${encodeURIComponent(id)}`);
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
        const response = await axios.get(
            `http://localhost:3000/countries/${encodeURIComponent(countryId)}/political_eras`
        );
        return response.data;
    } catch (e) {
        console.error('Erro ao ler eras políticas do país: ', e);
        throw e;
    }
}

export async function getAllDynasties() {
    try {
        const response = await axios.get('http://localhost:3000/dynasties');
        return response.data;
    } catch (e) {
        console.error('Erro ao ler dinastias: ', e);
        throw e;
    }
}

export async function getAllGovernmentTypes() {
    try {
        const response = await axios.get('http://localhost:3000/government_types');
        return response.data;
    } catch (e) {
        console.error('Erro ao ler tipos de governo: ', e);
        throw e;
    }
}

export async function createPoliticalEra(countryId, politicalEra) {
    try {
        const response = await axios.post(
            'http://localhost:3000/political_eras',
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

export async function getDynastyById(id) {
    try {
        const response = await axios.get(`http://localhost:3000/dynasties/${encodeURIComponent(id)}`);
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

        const response = await axios.get(`http://localhost:3000/countries/${country.id}/political_eras/show_by_year`, {
            params: { selected_date: date }
        });
        const data = response.data;

        return data;
    } catch (e) {
        console.error('Erro ao ler informações do país: ', e);
    }
}