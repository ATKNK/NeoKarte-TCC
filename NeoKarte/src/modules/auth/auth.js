import apiClient from '../apiClient';

export async function getCurrentUser() {
    const response = await apiClient.get('/session');
    return response.data?.user ?? response.data;
}

export async function signIn(credentials) {
    await apiClient.post('/session', {
        email_address: credentials.emailAddress,
        password: credentials.password,
    });
}

export async function signOut() {
    await apiClient.delete('/session');
}
