import { TRPCClientError, createTRPCClient } from '@trpc/client';

import type { AppRouter } from './../../../src/index';
import type { Cookies } from '@sveltejs/kit';
import { getTokenCookie } from './methods/utils';
import { httpBatchLink } from '@trpc/client';

const getAuthToken = () => {
	const documentCookies = document.cookie.split(';');
	const requiredCookies = ['access-token', 'refresh-token'];
	return documentCookies.filter((cookie) =>
		cookie.match(new RegExp(`^(${requiredCookies.join('|')})`))
	);
};

export const trpc = (cookies?: Cookies) =>
	createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url: 'http://localhost:3000' as string,
				headers(opts) {
					return {
						'Set-Cookie': getTokenCookie(cookies)
					};
				},
				fetch(url, options) {
					return fetch(url, {
						...options,
						credentials: 'include'
					});
				}
			})
		]
	});

export type TRPCError = TRPCClientError<AppRouter>;
