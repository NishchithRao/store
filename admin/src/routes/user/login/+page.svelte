<script lang="ts">
	import Form from '$lib/components/form.svelte';
	import type { PageProps } from './$types';

	const { form }: PageProps = $props();
</script>

{#if form?.success}
	<h1>Success</h1>
{/if}

<Form errors={form?.error?.['fields']} fields={['email', 'password']} method="POST" />
