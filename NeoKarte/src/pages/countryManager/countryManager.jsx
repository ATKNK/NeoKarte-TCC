import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './countryManager.css';
import { createCountry, getAllCountries } from '../../modules/maps/getCountry';

function CountryManager() {
    const [tagSearch, setTagSearch] = useState('');
    const [countries, setCountries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newCountry, setNewCountry] = useState({ tag: '', name: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');

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

    async function handleCreateCountry(event) {
        event.preventDefault();
        setCreateError('');
        setCreateSuccess('');

        const country = {
            tag: newCountry.tag.trim().toUpperCase(),
            name: newCountry.name.trim(),
        };

        if (!country.tag || !country.name) {
            setCreateError('Tag and name are required.');
            return;
        }

        setIsCreating(true);
        try {
            await createCountry(country);
            setNewCountry({ tag: '', name: '' });
            setCreateSuccess(`${country.name} (${country.tag}) was created.`);

            try {
                const updatedCountries = await getAllCountries();
                if (!Array.isArray(updatedCountries)) {
                    throw new Error('The server response does not contain a country list.');
                }
                setCountries(updatedCountries);
                setError('');
            } catch (refreshError) {
                setCreateError(
                    `Country created, but the list could not be refreshed: ${
                        refreshError instanceof Error ? refreshError.message : 'Unknown error.'
                    }`
                );
            }
        } catch (createRequestError) {
            const responseMessage = createRequestError?.response?.data?.error
                ?? createRequestError?.response?.data?.message;
            setCreateError(
                responseMessage
                    ?? (createRequestError instanceof Error ? createRequestError.message : 'Unknown error.')
            );
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <div className='countryManagerMain'>
            <h1 className='countryManagerTitle'>Country Manager</h1>
            <div className='countryManagerContent'>

                <div className='countryManagerSearch'>
                    <form className='countryManagerSearchForm' onSubmit={(event) => event.preventDefault()}>
                        <label htmlFor='countryTagSearchForm'>Search by Tag</label>
                        <input
                            type='search'
                            id='countryTagSearch'
                            name='countryTagSearch'
                            value={tagSearch}
                            onChange={(event) => setTagSearch(event.target.value)}
                            placeholder='Type a tag'
                        />
                    </form>
                    {isLoading && <p role='status'>Loading countries...</p>}
                    {error && <p className='countryManagerError' role='alert'>Could not load countries: {error}</p>}
                    {!isLoading && !error && (
                        <ul className='countryManagerList' aria-live='polite'>
                            {filteredCountries.map((country) => (
                                <li className='countryManagerItem' key={country.id ?? country.tag}>
                                    <span className='countryManagerItemTag'>{country.tag}</span>
                                    <span>{country.name ?? country.full_name ?? country.full_name_local ?? 'Could not get Name'}</span>
                                    <Link className='countryManagerButton' to={`/countries/${country.id ?? country.tag}`}>Manage</Link>
                                </li>
                            ))}
                            {filteredCountries.length === 0 && (
                                <li className='countryManagerEmpty'>No country found for this tag.</li>
                            )}
                        </ul>
                    )}
                </div>

                <div className='countryManagerCreate'>
                    <h2>Create country</h2>
                    <form className='countryManagerCreateForm' onSubmit={handleCreateCountry}>
                        <label htmlFor='countryTag'>Tag:</label>
                        <input
                            type='text'
                            id='countryTag'
                            name='tag'
                            value={newCountry.tag}
                            onChange={(event) => setNewCountry((current) => ({
                                ...current,
                                tag: event.target.value,
                            }))}
                            autoComplete='off'
                            required
                            disabled={isCreating}
                        />
                        <label htmlFor='countryName'>Name:</label>
                        <input
                            type='text'
                            id='countryName'
                            name='name'
                            value={newCountry.name}
                            onChange={(event) => setNewCountry((current) => ({
                                ...current,
                                name: event.target.value,
                            }))}
                            autoComplete='off'
                            required
                            disabled={isCreating}
                        />
                        <button className='countryManagerButton' type='submit' disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create country'}
                        </button>
                        {createError && <p className='countryManagerError' role='alert'>{createError}</p>}
                        {createSuccess && <p className='countryManagerSuccess' role='status'>{createSuccess}</p>}
                    </form>
                </div>

            </div>
        </div>
    );
}

export default CountryManager;