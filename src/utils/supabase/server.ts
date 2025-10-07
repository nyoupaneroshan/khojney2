// src/utils/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
// REMOVED: import { Database } from '@/types/supabase';

// REMOVED cache() - it doesn't work well with async cookies() in Next.js 15
// Made the function async and await cookies()
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies(); // AWAIT cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Can be ignored in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Can be ignored in Server Components
          }
        },
      },
    }
  );
};

// Updated getUser to work with async createSupabaseServerClient
export const getUser = async () => {
  const supabase = await createSupabaseServerClient(); // AWAIT the client creation
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};
