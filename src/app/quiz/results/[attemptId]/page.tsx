// src/app/quiz/results/[attemptId]/page.tsx

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import ResultsClient from './results-client';

// Updated interface with Promise
interface PageProps {
  params: Promise<{
    attemptId: string;
  }>;
}

// DYNAMIC SEO & SOCIAL SHARING METADATA
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { attemptId } = await params;
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  );
  
  const { data: attempt } = await supabase
    .from('quiz_attempts')
    .select(`score, categories(name_en)`)
    .eq('id', attemptId)
    .single();
    
  if (!attempt) {
    return { title: 'Quiz Result Not Found' };
  }
  
  // FIX: Simplified approach with type assertion
  const categories = attempt.categories as any;
  const categoryName = Array.isArray(categories) 
    ? categories[0]?.name_en 
    : categories?.name_en;
  
  const title = `My Quiz Result: ${attempt.score} in ${categoryName || 'General Knowledge'}!`;
  const description = 'I took a quiz on Khojney App! Check out my score and try to beat it.';

  return { title, description };
}

// MAIN SERVER COMPONENT
export default async function ResultsPage({ params }: PageProps) {
  const { attemptId } = await params;
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }
  
  const { data: attemptData, error } = await supabase
    .from('quiz_attempts')
    .select(`
        *,
        categories(name_en),
        user_answers(
            question_id,
            selected_option_id,
            questions(
                id,
                question_text_en,
                explanation_en,
                options(id, option_text_en, is_correct)
            )
        )
    `)
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single();
    
  if (error || !attemptData) {
    notFound();
  }

  const totalQuestions = attemptData.user_answers?.length || 0;
  const correctAnswers = attemptData.score || 0;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const timePerQuestion = totalQuestions > 0 && attemptData.time_taken_seconds
    ? (attemptData.time_taken_seconds / totalQuestions).toFixed(1)
    : '0';

  // FIX: Use type assertion to handle categories
  const categories = attemptData.categories as any;
  const categoryName = Array.isArray(categories)
    ? categories[0]?.name_en
    : categories?.name_en;

  const stats = {
      totalQuestions,
      correctAnswers,
      accuracy,
      timeTaken: attemptData.time_taken_seconds || 0,
      timePerQuestion,
      categoryName: categoryName || 'Quiz',
      completedAt: attemptData.completed_at,
  };

  return (
    <ResultsClient
      attemptId={attemptId}
      stats={stats}
      reviews={attemptData.user_answers || []}
    />
  );
}
