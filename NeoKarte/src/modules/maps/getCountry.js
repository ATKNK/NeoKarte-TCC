import axios from 'axios';

export async function getAllCountries() {

    try {
        const response = await axios.get('http://localhost:3000/countries');
        const data = response.data;

        return data;
    } catch (e) {
        console.error('Erro ao ler todos os países: ', e);
    }
}

export async function getCountryByTag(tag) {
    try {
        const response = await axios.get('http://localhost:3000/countries/' + tag);
        const data = response.data;

        return data;
    } catch (e) {
        console.error('Erro ao ler país: ', e);
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