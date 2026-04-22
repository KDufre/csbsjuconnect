import type { Booking, Ride, User } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const TOKEN_KEY = 'csbsju_connect_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const authApi = {
  register: (payload: { email: string; name: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => request<{ user: User }>('/auth/me'),
};

export const rideApi = {
  list: () => request<{ rides: Ride[] }>('/rides'),
  create: (payload: {
    destination: string;
    pickup_location: string;
    departure_time: string;
    total_seats: number;
  }) => request<{ ride: Ride }>('/rides', { method: 'POST', body: JSON.stringify(payload) }),
  cancel: (rideId: string) => request<{ ride: Ride }>(`/rides/${rideId}/cancel`, { method: 'PATCH' }),
  mine: () => request<{ rides: Ride[] }>('/rides/mine'),
};

export const bookingApi = {
  create: (rideId: string) => request<{ booking: Booking }>(`/bookings`, {
    method: 'POST',
    body: JSON.stringify({ rideId }),
  }),
  mine: () => request<{ bookings: Array<Booking & { ride: Ride }> }>('/bookings/mine'),
  cancel: (bookingId: string) => request<{ booking: Booking }>(`/bookings/${bookingId}/cancel`, { method: 'PATCH' }),
  byRide: (rideId: string) => request<{ bookings: Booking[] }>(`/bookings/ride/${rideId}`),
};
