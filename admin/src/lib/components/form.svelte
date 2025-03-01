<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ErrorOutput } from '$lib/methods/error';
	import { Button, TextInput } from 'carbon-components-svelte';

	type Props = {
		fields: string[];
		action?: string;
		method?: any;
		intialData?: {
			[key in Props['fields'][number]]: string;
		};
		customFields?: {
			[key in Props['fields'][number]]: Record<string, any>;
		};
		errors?: ErrorOutput['fields'];
	};

	let {
		fields,
		action = '?',
		customFields = {},
		method = 'POST',
		intialData,
		errors
	}: Props = $props();
</script>

<form
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				await invalidateAll();
			}
			return await applyAction(result);
		};
	}}
	{method}
	{action}
	enctype={fields.includes('images') ? 'multipart/form-data' : undefined}
>
	{#each fields as field}
		<label for="email">{field}</label>
		<TextInput
			onchange={() => (errors = [])}
			class={errors?.find((err) => err.name === field)?.message ? 'error' : ''}
			value={intialData?.[field]}
			type={field}
			name={field}
			id={field}
			{...customFields?.[field]}
		/>
	{/each}
	<Button type="submit">Submit</Button>
</form>

<style>
	.error {
		border: 1px solid red;
	}
</style>
