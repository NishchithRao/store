import { createClient } from '@supabase/supabase-js';
import { generate } from 'shortid';

// Create Supabase client
const supabase = createClient(
	'https://ppaocbkuzuncfavfipxc.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYW9jYmt1enVuY2ZhdmZpcHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjgzOTgsImV4cCI6MjA1NjM0NDM5OH0.B2fpe0_ftvsBQfNaOj6DKZSa397yUn7KxW8vo5cYqNo'
);

export async function uploadFile(file: File) {
	const id = generate();
	const { data, error } = await supabase.storage.from('images').upload(id, file, { upsert: false });
	if (error) {
		console.log(error);
		return null;
	} else {
		return id;
	}
}
