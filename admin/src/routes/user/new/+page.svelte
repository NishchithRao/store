<script lang="ts">
	import { goto } from '$app/navigation';
	import Form from '$lib/components/form.svelte';
	import { redirect } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	const { form }: PageProps = $props();
	if (form?.success) {
		setTimeout(() => {
			redirect(303, '/');
		}, 3000);
	}
</script>

<p>New user</p>

{#if form?.success}
	<p>User created successfully</p>
	<p>Going back to homepage</p>
{/if}

{#if form?.error?.message}
	<p>{form?.error?.message}</p>
{/if}

<Form errors={form?.error?.fields} fields={['email', 'password', 'name']} action="/user/new" />
