import './peopleManager.css';
import { useEffect, useState } from 'react';
import Form from '../../components/form/form';
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
    const personFields = [
        { id: 'personName', name: 'name', label: 'Nome *', required: true, autoComplete: 'off' },
        { id: 'personBirth', name: 'birth', label: 'Data de nascimento', type: 'date' },
        {
            id: 'personBirthApproximate',
            name: 'birth_approximate',
            label: 'Nascimento aproximado',
            type: 'checkbox',
            labelClassName: 'peopleManagerCheckboxLabel',
        },
        { id: 'personDeath', name: 'death', label: 'Data de falecimento', type: 'date' },
        {
            id: 'personDeathApproximate',
            name: 'deathdate_approximate',
            label: 'Falecimento aproximado',
            type: 'checkbox',
            labelClassName: 'peopleManagerCheckboxLabel',
        },
        {
            id: 'personDynasty',
            name: 'dynasty_id',
            label: 'Dinastia',
            type: 'select',
            disabled: Boolean(dynastyError),
            message: dynastyError
                ? `Não foi possível carregar as dinastias: ${dynastyError}`
                : '',
            messageClassName: 'peopleManagerError',
            messageRole: 'alert',
            options: [
                { value: '', label: 'Nenhuma' },
                ...dynasties.map((dynasty) => ({ value: dynasty.id, label: dynasty.name })),
            ],
        },
    ];

    function handlePersonChange(name, value) {
        setNewPerson((current) => ({ ...current, [name]: value }));
    }

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

                <Form
                    title='Cadastrar pessoa'
                    fields={personFields}
                    values={newPerson}
                    onChange={handlePersonChange}
                    onSubmit={handleCreatePerson}
                    submitLabel='Cadastrar pessoa'
                    submittingLabel='Cadastrando...'
                    isSubmitting={isCreating}
                    error={createError}
                    success={createSuccess}
                    className='peopleManagerCreate'
                    formClassName='peopleManagerCreateForm'
                    buttonClassName='peopleManagerButton'
                    errorClassName='peopleManagerError'
                    successClassName='peopleManagerSuccess'
                />
            </div>
        </main>
    );
}

export default PeopleManager;