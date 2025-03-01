import type { Actions } from './$types';
import { handleAPI } from '$lib/methods/utils';

export const actions = {
	default: async (event) => {
		const res = await handleAPI(event, '/user/new');
		return res;
	}
} satisfies Actions;
