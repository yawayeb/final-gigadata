import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const isPlaceholderUrl =
  !supabaseUrl ||
  supabaseUrl.startsWith('https://YOUR_') ||
  supabaseUrl.includes('your_project_ref') ||
  supabaseUrl.includes('placeholder');

const isValidUrl = supabaseUrl.startsWith('https://') && !isPlaceholderUrl;

if (isPlaceholderUrl || !supabaseUrl) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL is missing or still a placeholder. ' +
    'Set it in .env to your project URL from Supabase Dashboard → Project Settings → API (e.g. https://xxxxx.supabase.co). ' +
    'Then restart the dev server (npm run dev).'
  );
}

export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co',
  isValidUrl ? supabaseAnonKey : 'placeholder'
);
