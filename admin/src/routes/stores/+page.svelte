<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Form from '$lib/components/form.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<p>Stores</p>

{#if 'error' in data.stores}
	<p>{data.stores.error?.message}</p>
{/if}

<p>Stores list</p>
{#if Array.isArray(data.stores)}
	{#each data.stores as dataItem}
		{#key dataItem.id}
			<div>
				<p>{dataItem.title}</p>
				<div>
					<p>Delete</p>
					<Form action="?/delete" intialData={{ id: dataItem.id }} fields={['id']} method="POST" />
				</div>
			</div>
		{/key}
	{/each}
{/if}

<Form fields={['title']} action="?/create" />
