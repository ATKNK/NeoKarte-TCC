import axios from 'axios';

const apiUrl = '/api';

const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
        const csrfResponse = await apiClient.get('/csrf_token');
        const csrfToken = csrfResponse.data?.token;
        if (typeof csrfToken !== 'string' || csrfToken.length === 0) {
            throw new Error('A API não retornou um token CSRF válido em /csrf_token.');
        }
        config.headers.set('X-CSRF-Token', csrfToken);
    }

    return config;
});

export default apiClient;