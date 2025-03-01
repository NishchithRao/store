import { type Cookies } from '@sveltejs/kit';
import { handleError } from './error';
import { trpc, type TRPCError } from '$lib/trpc';
import { refreshToken } from './utils';
import { uploadFile } from '$lib/supabase';

export const getProducts = async (cookies: Cookies) => {
	try {
		return await trpc(cookies).product.list.query();
	} catch (error) {
		const err = handleError(error as any);
		if (err.error.refresh) {
			refreshToken(cookies);
		}
		return err;
	}
};

const createProduct = async (
	data: { title: string; price: string },
	cookies?: Cookies,
	images: string[] = []
) => {
	try {
		return await trpc(cookies).product.create.mutate({
			...data,
			price: parseFloat(data.price),
			images
		});
	} catch (err) {
		return handleError(err as TRPCError);
	}
};

const deleteProduct = async (data: { id: string }, cookies?: Cookies) => {
	try {
		return await trpc(cookies).product.delete.mutate(data);
	} catch (err) {
		return handleError(err as TRPCError);
	}
};

export const uploadImages = async (data: File[]) => {
	const downloadUrls: string[] = [];
	for await (const file of data) {
		const url = await uploadFile(file);
		if (url) downloadUrls.push(url);
	}
	return downloadUrls;
};

export const mutateFnByPathPorduct = {
	'/products/create': createProduct,
	'/products/delete': deleteProduct
};
