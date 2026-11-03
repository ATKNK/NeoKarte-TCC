import './peopleManager.css';
import { useEffect, useState } from 'react';
import { createPerson, getAllDynasties, getAllPeople } from '../../modules/maps/getCountry';

const emptyPerson = {
    name: '',
    birth: '',
    death: '',
    dynasty_id: '',
    birth_approximate: false,
    deathdate_approximate: false,
};

function getErrorMessage(error) {
    return error?.response?.data?.error
        ?? error?.response?.data?.message
        ?? (error instanceof Error ? error.message : 'Erro desconhecido.');
}

function PeopleManager() {
    const [nameSearch, setNameSearch] = useState('');
    const [people, setPeople] = useState([]);
    const [dynasties, setDynasties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [dynastyError, setDynastyError] = useState('');
    const [newPerson, setNewPerson] = useState(emptyPerson);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function loadPeople() {
            try {
                const [peopleResponse, dynastyResponse] = await Promise.all([
                    getAllPeople(),
                    getAllDynasties().catch((loadError) => {
                        if (isMounted) {
                            setDynastyError(getErrorMessage(loadError));
                        }
                        return null;
                    }),
                ]);
                const peopleData = Array.isArray(peopleResponse)
                    ? peopleResponse
                    : peopleResponse?.people ?? peopleResponse?.data;
                if (!Array.isArray(peopleData)) {
                    throw new Error('A resposta do servidor não contém uma lista de pessoas.');
                }

                if (isMounted) {
                    setPeople(peopleData);
                    if (Array.isArray(dynastyResponse)) {
                        setDynasties(dynastyResponse);
                    } else if (dynastyResponse !== null) {
                        setDynastyError('A resposta do servidor não contém uma lista de dinastias.');
                    }
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(getErrorMessage(loadError));
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadPeople();
        return () => {
            isMounted = false;
        };
    }, []);

    const normalizedName = nameSearch.trim().toLocaleLowerCase();
    const filteredPeople = people.filter((person) =>
        String(person.name ?? '').toLocaleLowerCase().includes(normalizedName)
    );
    const dynastyNames = Object.fromEntries(dynasties.map((dynasty) => [dynasty.id, dynasty.name]));

    async function handleCreatePerson(event) {
        event.preventDefault();
        setCreateError('');
        setCreateSuccess('');

        const person = {
            name: newPerson.name.trim(),
            birth: newPerson.birth || null,
            death: newPerson.death || null,
            dynasty_id: newPerson.dynasty_id ? Number(newPerson.dynasty_id) : null,
            birth_approximate: newPerson.birth_approximate,
            deathdate_approximate: newPerson.deathdate_approximate,
        };

        if (!person.name) {
            setCreateError('O nome é obrigatório.');
            return;
        }
        if (person.birth && person.death && person.death < person.birth) {
            setCreateError('A data de falecimento deve ser igual ou posterior à data de nascimento.');
            return;
        }

        setIsCreating(true);
        try {
            await createPerson(person);
            setNewPerson(emptyPerson);
            setCreateSuccess(`${person.name} foi cadastrada com sucesso.`);

            try {
                const peopleResponse = await getAllPeople();
                const updatedPeople = Array.isArray(peopleResponse)
                    ? peopleResponse
                    : peopleResponse?.people ?? peopleResponse?.data;
                if (!Array.isArray(updatedPeople)) {
                    throw new Error('A resposta do servidor não contém uma lista de pessoas.');
                }
                setPeople(updatedPeople);
                setError('');
            } catch (refreshError) {
                setCreateError(
                    `Pessoa criada, mas não foi possível atualizar a lista: ${getErrorMessage(refreshError)}`
                );
            }
        } catch (createRequestError) {
            setCreateError(getErrorMessage(createRequestError));
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <main className='peopleManagerMain'>
            <h1 className='peopleManagerTitle'>Gerenciador de pessoas</h1>
            <div className='peopleManagerContent'>
                <section className='peopleManagerSearch' aria-label='Pessoas cadastradas'>
                    <form className='peopleManagerSearchForm' onSubmit={(event) => event.preventDefault()}>
                        <label htmlFor='personNameSearch'>Buscar por nome</label>
                        <input
                            type='search'
                            id='personNameSearch'
                            name='personNameSearch'
                            value={nameSearch}
                            onChange={(event) => setNameSearch(event.target.value)}
                            placeholder='Digite um nome'
                        />
                    </form>
                    {isLoading && <p role='status'>Carregando pessoas...</p>}
                    {error && <p className='peopleManagerError' role='alert'>Não foi possível carregar as pessoas: {error}</p>}
                    {!isLoading && !error && (
                        <ul className='peopleManagerList' aria-live='polite'>
                            {filteredPeople.map((person) => (
                                <li className='peopleManagerItem' key={person.id ?? person.name}>
                                    <div className='peopleManagerPersonInfo'>
                                        <strong>{person.name}</strong>
                                        <span>
                                            {person.birth || person.death
                                                ? `${person.birth ?? '?'} – ${person.death ?? '?'}`
                                                : 'Datas não informadas'}
                                        </span>
                                        {person.dynasty_id != null && (
                                            <span>Dinastia: {dynastyNames[person.dynasty_id] ?? `#${person.dynasty_id}`}</span>
                                        )}
                                        {(person.birth_approximate || person.deathdate_approximate) && (
                                            <span>
                                                Datas aproximadas:
                                                {person.birth_approximate ? ' nascimento' : ''}
                                                {person.birth_approximate && person.deathdate_approximate ? ',' : ''}
                                                {person.deathdate_approximate ? ' falecimento' : ''}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                            {filteredPeople.length === 0 && (
                                <li className='peopleManagerEmpty'>Nenhuma pessoa encontrada.</li>
                            )}
                        </ul>
                    )}
                </section>

                <section className='peopleManagerCreate'>
                    <h2>Cadastrar pessoa</h2>
                    <form className='peopleManagerCreateForm' onSubmit={handleCreatePerson}>
                        <label htmlFor='personName'>Nome *</label>
                        <input
                            type='text'
                            id='personName'
                            name='name'
                            value={newPerson.name}
                            onChange={(event) => setNewPerson((current) => ({
                                ...current,
                                name: event.target.value,
                            }))}
                            autoComplete='off'
                            required
                            disabled={isCreating}
                        />

                        <label htmlFor='personBirth'>Data de nascimento</label>
                        <input
                            type='date'
                            id='personBirth'
                            name='birth'
                            value={newPerson.birth}
                            onChange={(event) => setNewPerson((current) => ({
                                ...current,
                                birth: event.target.value,
                            }))}
                            disabled={isCreating}
                        />
                        <label className='peopleManagerCheckboxLabel' htmlFor='personBirthApproximate'>
                            <input
                                type='checkbox'
                                id='personBirthApproximate'
                                name='birth_approximate'
                                checked={newPerson.birth_approximate}
                                onChange={(event) => setNewPerson((current) => ({
                                    ...current,
                                    birth_approximate: event.target.checked,
                                }))}
                                disabled={isCreating}
                            />
                            Nascimento aproximado
                        </label>

                        <label htmlFor='personDeath'>Data de falecimento</label>
                        <input
                            type='date'
                            id='personDeath'
                            name='death'
                            value={newPerson.death}
                            onChange={(event) => setNewPerson((current) => ({
                                ...current,
                                death: event.target.value,
                            }))}
                            disabled={isCreating}
                        />
                        <label className='peopleManagerCheckboxLabel' htmlFor='personDeathApproximate'>
                            <input
                                type='checkbox'
                                id='personDeathApproximate'
                                name='deathdate_approximate'
                                checked={newPerson.deathdate_approximate}
                                onChange={(event) => setNewPerson((current) => ({
                                    ...current,
                                    deathdate_approximate: event.target.checked,
                                }))}
                                disabled={isCreating}
                            />
                            Falecimento aproximado
                        </label>

                        <label htmlFor='personDynasty'>Dinastia</label>
                        <select
                            id='personDynasty'
                            name='dynasty_id'
                            value={newPerson.dynasty_id}
                            onChange={(event) => setNewPerson((current) => ({
                                ...current,
                                dynasty_id: event.target.value,
                            }))}
                            disabled={isCreating || Boolean(dynastyError)}
                        >
                            <option value=''>Nenhuma</option>
                            {dynasties.map((dynasty) => (
                                <option key={dynasty.id} value={dynasty.id}>{dynasty.name}</option>
                            ))}
                        </select>
                        {dynastyError && (
                            <p className='peopleManagerError' role='alert'>
                                Não foi possível carregar as dinastias: {dynastyError}
                            </p>
                        )}

                        <button className='peopleManagerButton' type='submit' disabled={isCreating}>
                            {isCreating ? 'Cadastrando...' : 'Cadastrar pessoa'}
                        </button>
                        {createError && <p className='peopleManagerError' role='alert'>{createError}</p>}
                        {createSuccess && <p className='peopleManagerSuccess' role='status'>{createSuccess}</p>}
                    </form>
                </section>
            </div>
        </main>
    );
}

export default PeopleManager;