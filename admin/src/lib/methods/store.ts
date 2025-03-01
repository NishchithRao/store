import { type Cookies } from '@sveltejs/kit';
import { handleError } from './error';
import { trpc, type TRPCError } from '$lib/trpc';
import { refreshToken } from './utils';

export const getStores = async (cookies: Cookies) => {
	try {
		return await trpc(cookies).store.list.query();
	} catch (error) {
		const err = handleError(error as any);
		if (err.error.refresh) {
			refreshToken(cookies);
		}
		return err;
	}
};

const createStore = async (data: { title: string }, cookies?: Cookies) => {
	try {
		return await trpc(cookies).store.create.mutate(data);
	} catch (err) {
		return handleError(err as TRPCError);
	}
};

const deleteStore = async (data: { id: string }, cookies?: Cookies) => {
	try {
		return await trpc(cookies).store.delete.mutate(data);
	} catch (err) {
		return handleError(err as TRPCError);
	}
};

export const mutateFnByPathStore = {
	'/stores/create': createStore,
	'/stores/delete': deleteStore
};
