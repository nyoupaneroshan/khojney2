// src/app/category/[slug]/category-content.tsx

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import CategoryClient from './category-client';
// REMOVED: import { Database } from '@/types/supabase';
import { Question, Category } from './types';

interface PageParams {
  slug: string;
}

// This is the new async component that handles all dynamic work
export default async function CategoryContent({ params }: { params: PageParams }) {
  const { slug } = params;
  
  // FIX: AWAIT cookies() for Next.js 15
  const cookieStore = await cookies();

  // REMOVED <Database> type parameter
  const supabase = createServerClient(
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

  const { data: categoryData, error } = await supabase
    .from('categories')
    .select(`
      id, name_en, description_en, slug,
      questions:question_categories(questions(id, question_text_en))
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !categoryData) {
    notFound();
  }
  
  // FIX: Handle the array structure from Supabase joins
  const questions = (categoryData.questions || [])
    .map((qc: any) => qc.questions)
    .filter(Boolean) as Question[];
  
  const category: Category = {
    id: categoryData.id,
    name_en: categoryData.name_en,
    slug: categoryData.slug,
    description_en: categoryData.description_en,
  };

  return <CategoryClient category={category} questions={questions} />;
}
