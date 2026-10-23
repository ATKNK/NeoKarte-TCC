import { useEffect, useState } from 'react';
import './countryManager.css';
import { getAllCountries } from '../../modules/maps/getCountry';

function CountryManager() {
    const [tagSearch, setTagSearch] = useState('');
    const [countries, setCountries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const tag = '';

    useEffect(() => {
        let isMounted = true;

        async function loadCountries() {
            try {
                const data = await getAllCountries();
                if (!Array.isArray(data)) {
                    throw new Error('A resposta do servidor não contém uma lista de países.');
                }
                if (isMounted) {
                    setCountries(data);
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

        loadCountries();
        return () => {
            isMounted = false;
        };
    }, []);

    const normalizedTag = tagSearch.trim().toLocaleLowerCase();
    const filteredCountries = countries.filter((country) =>
        String(country.tag ?? '').toLocaleLowerCase().includes(normalizedTag)
    );

    return (
        <div className='countryManagerMain'>
            <h1 className='countryManagerTitle'>Gerenciamento de países</h1>
            <form className='countryManagerSearch' onSubmit={(event) => event.preventDefault()}>
                <label htmlFor='countryTag'>Buscar por tag:</label>
                <input
                    type='search'
                    id='countryTag'
                    name='countryTag'
                    value={tagSearch}
                    onChange={(event) => setTagSearch(event.target.value)}
                    placeholder='Digite uma tag'
                />
            </form>
            {isLoading && <p role='status'>Carregando países...</p>}
            {error && <p className='countryManagerError' role='alert'>Não foi possível carregar os países: {error}</p>}
            {!isLoading && !error && (
                <ul className='countryManagerList' aria-live='polite'>
                    {filteredCountries.map((country) => (
                        <li className='countryManagerItem' key={country.id ?? country.tag}>
                            <span className='countryManagerItemTag'>{country.tag}</span>
                            <span>{country.name ?? country.full_name ?? country.full_name_local ?? 'Nome indisponível'}</span>
                            <a className='countryManagerButton' href={'countries/' + country.tag}>Gerenciar</a>
                        </li>
                    ))}
                    {filteredCountries.length === 0 && (
                        <li className='countryManagerEmpty'>Nenhum país corresponde à tag informada.</li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default CountryManager;