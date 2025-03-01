import type { Actions } from './$types';
import { cookieOptions, handleAPI } from '$lib/methods/utils';
import type { SetOption } from 'cookies';

export const actions = {
	default: async (event) => {
		const res = await handleAPI(event, '/user/login');
		if ('accessToken' in res.data) {
			event.cookies.set('access-token', res.data.accessToken, cookieOptions);
			event.cookies.set('refresh-token', res.data.refreshToken, cookieOptions);
		}
		return res;
	}
} satisfies Actions;
