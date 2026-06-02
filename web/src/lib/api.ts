const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('revomart_token');
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.message || data.error || 'Request failed',
      res.status,
    );
  }
  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ user: unknown; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: Record<string, string>) =>
    api<{ user: unknown; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const productsApi = {
  list: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return api<{ items: unknown[]; meta: unknown }>(
      `/products${q ? `?${q}` : ''}`,
    );
  },
  get: (slug: string) => api<unknown>(`/products/${slug}`),
};

export const categoriesApi = {
  list: () => api<unknown[]>('/categories'),
};

export const cartApi = {
  get: () => api<unknown>('/cart'),
  add: (productId: string, quantity = 1) =>
    api('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  update: (productId: string, quantity: number) =>
    api(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  remove: (productId: string) =>
    api(`/cart/items/${productId}`, { method: 'DELETE' }),
};

export const ordersApi = {
  list: () => api<unknown[]>('/orders'),
  get: (id: string) => api<unknown>(`/orders/${id}`),
  create: (data: Record<string, string>) =>
    api('/orders', { method: 'POST', body: JSON.stringify(data) }),
};

export const adminApi = {
  dashboard: () => api<unknown>('/admin/dashboard'),
  orders: (status?: string) =>
    api<unknown[]>(`/admin/orders${status ? `?status=${status}` : ''}`),
  inventory: () => api<unknown[]>('/admin/inventory'),
};
