// src/app/category/[slug]/page.tsx

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CategoryClient from './category-client'
import { createSupabaseServerClient } from '@/utils/supabase/server'

// --- Type Definitions ---
interface PageParams {
  slug: string
}

interface PageProps {
  params: PageParams
}

interface Question {
  id: string
  question_text_en: string
}

interface Category {
  id: string
  name_en: string
  slug: string
  description_en: string | null
}

// --- Dynamic Metadata ---
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const supabase = createSupabaseServerClient()
  const { data: category } = await supabase
    .from('categories')
    .select('name_en, description_en')
    .eq('slug', params.slug)
    .single()

  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: `${category.name_en} Quiz`,
    description:
      category.description_en ||
      `Practice quiz questions for the ${category.name_en} category.`,
  }
}

// --- Main Page ---
export default async function CategoryPage({ params }: PageProps) {
  const { slug } = params
  const supabase = createSupabaseServerClient()

  const { data: categoryData, error } = await supabase
    .from('categories')
    .select(`
      id, name_en, description_en, slug,
      questions:question_categories(questions(id, question_text_en))
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !categoryData) {
    notFound()
  }

  const questions =
    categoryData.questions
      ?.map((q: any) => q.questions)
      .filter(Boolean) as Question[] || []

  const category: Category = {
    id: categoryData.id,
    name_en: categoryData.name_en,
    slug: categoryData.slug,
    description_en: categoryData.description_en,
  }

  return <CategoryClient category={category} questions={questions} />
}
