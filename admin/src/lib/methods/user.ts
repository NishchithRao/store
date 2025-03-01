import { trpc, type TRPCError } from '$lib/trpc';
import { handleError } from './error';

const login = async (data: { email: string; password: string }) => {
	try {
		return await trpc().user.signIn.mutate(data);
	} catch (err) {
		return handleError(err as TRPCError);
	}
};

const register = async (data: { name: string; email: string; password: string }) => {
	try {
		return await trpc().user.register.mutate(data);
	} catch (err) {
		return handleError(err as TRPCError);
	}
};

export const mutateFnByPathUser = {
	'/user/login': login,
	'/user/new': register
};
