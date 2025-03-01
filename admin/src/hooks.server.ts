import { BACKEND_URL, FRONTEND_URL } from '$env/static/private';
import { redirect, type Handle } from '@sveltejs/kit';
import type { HandleFetch } from '@sveltejs/kit';

const allowedRoutes = ['/user/login', '/user/new'];

export const handle: Handle = async ({ event, resolve }) => {
	if (!allowedRoutes.includes(event.url.pathname)) {
		const cookies = event.cookies;
		const accessToken = cookies.get('access-token');
		if (!accessToken) {
			return redirect(307, '/user/login');
		}
	}
	const response = await resolve(event);

	return response;
};

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	request.headers.set('cookie', event.request.headers.get('access-token') as string);

	return fetch(request);
};
