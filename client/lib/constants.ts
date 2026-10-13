export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';


async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
}


export const api = {
    get: async <T>(url: string): Promise<T> => {
        return request<T>(url, { method: 'GET' });
    },
    post: async <T>(url: string, body: unknown): Promise<T> => {
        return request<T>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    },
    put: async <T>(url: string, body: unknown): Promise<T> => {
        return request<T>(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    },
    delete: async <T>(url: string): Promise<T> => {
        return request<T>(url, { method: 'DELETE' });
    },
}