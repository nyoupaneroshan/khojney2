// src/app/category/[slug]/page.tsx

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CategoryClient from './category-client'
import { createSupabaseServerClient } from '@/utils/supabase/server'

// --- Type Definitions ---
interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// --- Dynamic Metadata ---
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } = await params
  const supabase = createSupabaseServerClient()
  
  const { data: category } = await supabase
    .from('categories')
    .select('name_en, description_en')
    .eq('slug', slug)
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
  const { slug } = await params
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
      .filter(Boolean) || []

  const category = {
    id: categoryData.id,
    name_en: categoryData.name_en,
    slug: categoryData.slug,
    description_en: categoryData.description_en,
  }

  return <CategoryClient category={category} questions={questions} />
}