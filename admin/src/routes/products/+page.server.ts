import { handleAPI } from '$lib/methods/utils';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { getProducts, uploadImages } from '$lib/methods/product';
import { uploadFile } from '$lib/supabase';

export const load: PageServerLoad = async ({ cookies }) => {
	return { products: await getProducts(cookies) };
};

export const actions = {
	create: async (event) => {
		const formData = await event.request.formData();
		const imageFiles = formData.getAll('images') as File[];
		console.log(imageFiles);
		const images = await uploadImages(imageFiles);
		const res = await handleAPI(event, '/products/create', images, formData);
		return res;
	},
	delete: async (event) => {
		const res = await handleAPI(event, '/products/delete');
		return res;
	}
} satisfies Actions;
