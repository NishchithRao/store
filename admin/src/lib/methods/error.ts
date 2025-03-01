import type { TRPCError } from '$lib/trpc';
import { error } from '@sveltejs/kit';

export type ErrorOutput = {
	fields?: {
		name: string;
		message: string;
	}[];
	redirect?: boolean;
	message?: string;
	refresh?: boolean;
};

type ValidationErrors = {
	validation: string;
	message: string;
	path?: string[];
};

export const handleError = (err: TRPCError): { error: ErrorOutput } => {
	const finalError: ErrorOutput = {};
	if (err.message === 'fetch failed') {
		error(500, 'Server down');
	}
	switch (err.data?.code) {
		case 'CONFLICT':
			finalError['message'] = err.message;
			break;
		case 'BAD_REQUEST':
			{
				const message = JSON.parse(err?.message as string);
				console.log(message);
				switch (true) {
					case err?.message.includes('validation') || err?.message.includes('path'):
						{
							const error = message as ValidationErrors[];
							finalError.fields = [];
							error.forEach((err, i) => {
								if (finalError.fields)
									finalError.fields[i] = {
										name: err.validation || err.path?.[0] || '',
										message: err.message
									};
							});
						}
						break;
					case err.message.includes('too_small'): {
						finalError.fields = [
							{ name: 'password', message: 'Password must be at least 6 characters' }
						];
					}
				}
			}
			break;
		case 'NOT_FOUND':
			finalError['redirect'] = true;
		case 'UNAUTHORIZED':
			finalError['message'] = err.message;
			finalError.refresh = true;
			break;
	}
	return { error: finalError };
};
