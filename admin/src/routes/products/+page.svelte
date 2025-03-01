<script lang="ts">
	import Form from '$lib/components/form.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>Products</h1>

{#if 'error' in data.products}
	<p>{data.products.error?.message}</p>
{/if}

<p>Products list</p>
{#if Array.isArray(data.products)}
	{#each data.products as dataItem}
		{#key dataItem.id}
			<div>
				<p>{dataItem.title}</p>
				<p>{dataItem.price}</p>
				<div>
					<p>Delete</p>
					<Form action="?/delete" intialData={{ id: dataItem.id }} fields={['id']} method="POST" />
				</div>
			</div>
		{/key}
	{/each}
{/if}

<Form
	customFields={{
		images: {
			type: 'file',
			multiple: true,
			accept: 'image/*'
		}
	}}
	errors={form?.error.fields}
	fields={['title', 'price', 'images']}
	action="?/create"
/>
