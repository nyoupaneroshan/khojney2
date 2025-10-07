// src/utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
// REMOVED: import { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
