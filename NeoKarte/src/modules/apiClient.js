import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
        const csrfResponse = await axios.get('http://localhost:3000/csrf_token', {
            withCredentials: true,
        });
        const csrfToken = csrfResponse.data?.token;
        if (typeof csrfToken !== 'string' || csrfToken.length === 0) {
            throw new Error('A API não retornou um token CSRF válido em /csrf_token.');
        }
        config.headers.set('X-CSRF-Token', csrfToken);
    }

    return config;
});

export default apiClient;
