import type { Actions, PageServerLoad } from './$types';
import { getStores } from '$lib/methods/store';
import { handleAPI } from '$lib/methods/utils';

export const load: PageServerLoad = async ({ cookies }) => {
	return { stores: await getStores(cookies) };
};

export const actions = {
	create: async (event) => {
		const res = await handleAPI(event, '/stores/create');
		return res;
	},
	delete: async (event) => {
		const res = await handleAPI(event, '/stores/delete');
		return res;
	}
} satisfies Actions;
