import type { Cookies, RequestEvent } from '@sveltejs/kit';
import type { ErrorOutput, handleError } from './error';

import type { RouteParams } from '../../routes/$types';
import type { SetOption } from 'cookies';
import { multateByPath } from '.';
import { trpc } from '$lib/trpc';

export const handleAPI = async <A extends RouteParams, V extends string>(
	event: RequestEvent<A, V>,
	path: V,
	images?: string[],
	parsedFormData?: FormData
) => {
	const fn = multateByPath[path as keyof typeof multateByPath];
	const formData = parsedFormData || (await event.request.formData());
	const data = Object.fromEntries(formData.entries()) as Parameters<typeof fn>[0];
	const res = await fn(data as any, event.cookies, images);
	return {
		data: res,
		error: (res as ReturnType<typeof handleError>)?.error,
		success: !('error' in res)
	};
};

export const cookieOptions: SetOption & { path: string } = {
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax',
	path: '/',
	maxAge: 60 * 60 * 24 * 30 * 7
};

export const refreshToken = async (cookies: Cookies) => {
	const refreshToken = cookies.get('refresh-token') as string;
	const accessToken = await trpc(cookies).user.refreshToken.mutate({
		refreshToken
	});
	try {
		cookies.set('access-token', accessToken, cookieOptions);
	} catch (error) {
		console.log(error);
	}
};

export const getTokenCookie = (cookies?: Cookies) => {
	const accessToken = cookies?.get('access-token');
	return `access-token=${accessToken}`;
};
