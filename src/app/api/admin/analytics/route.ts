// src/app/api/admin/analytics/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
// REMOVED: import { Database } from '@/types/supabase';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  // UPDATED: Use cookies() properly for Next.js 15
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
            // Can be ignored in API routes
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Can be ignored in API routes
          }
        },
      },
    }
  );

  const { searchParams } = new URL(request.url);
  
  // --- Read date range and userId from params ---
  const userId = searchParams.get('userId') || 'all';
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date();
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : subDays(to, 30);

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user?.app_metadata?.role !== 'admin') {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    // Build the query with proper conditional logic
    let attemptsQuery = supabase
      .from('quiz_attempts')
      .select('score, created_at, categories(name_en)')
      .eq('status', 'completed')
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString());

    // Apply userId filter only if not 'all'
    if (userId !== 'all') {
      attemptsQuery = attemptsQuery.eq('user_id', userId);
    }

    // --- Fetch all data points in parallel ---
    const [
      attemptsRes,
      questionStatsRes,
      userSignupsRes,
      leaderboardRes
    ] = await Promise.all([
      // 1. Quiz attempts within date range
      attemptsQuery,
      // 2. Question stats
      supabase.from('question_stats').select('question_id, correct_percentage, total_attempts, questions(question_text_en)'),
      // 3. New user signups
      supabase.from('profiles').select('created_at')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString()),
      // 4. Leaderboard data
      supabase.from('profiles').select('full_name, id, total_score')
        .order('total_score', { ascending: false, nullsFirst: false })
        .limit(10)
    ]);

    if (attemptsRes.error) throw attemptsRes.error;
    
    // --- Process all data on the server ---
    const attempts = attemptsRes.data || [];
    
    // Calculate KPIs
    const totalAttempts = attempts.length;
    const averageScore = attempts.length > 0 
      ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length 
      : 0;
    
    // Category performance
    const categoryPerformance: Record<string, { total: number; totalScore: number }> = {};
    attempts.forEach(attempt => {
      const categoryName = attempt.categories?.name_en || 'Uncategorized';
      if (!categoryPerformance[categoryName]) {
        categoryPerformance[categoryName] = { total: 0, totalScore: 0 };
      }
      categoryPerformance[categoryName].total += 1;
      categoryPerformance[categoryName].totalScore += attempt.score || 0;
    });

    const categoryChartData = Object.entries(categoryPerformance).map(([category, data]) => ({
      category,
      "Average Score": Math.round(data.totalScore / data.total),
      "Attempts": data.total
    }));

    // Activity over time
    const attemptsByDay: Record<string, number> = {};
    attempts.forEach(attempt => {
      const date = new Date(attempt.created_at).toISOString().split('T')[0];
      attemptsByDay[date] = (attemptsByDay[date] || 0) + 1;
    });

    const activityChartData = Object.entries(attemptsByDay)
      .map(([date, count]) => ({ date, "Attempts": count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Question stats
    const questionStats = {
      hardest: (questionStatsRes.data || [])
        .sort((a, b) => (a.correct_percentage || 0) - (b.correct_percentage || 0))
        .slice(0, 5),
      easiest: (questionStatsRes.data || [])
        .sort((a, b) => (b.correct_percentage || 0) - (a.correct_percentage || 0))
        .slice(0, 5),
    };

    // User signup trends
    const userSignupsByDay = (userSignupsRes.data || []).reduce((acc, u) => {
      const date = new Date(u.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const userSignupChartData = Object.entries(userSignupsByDay)
      .map(([date, count]) => ({ date, "New Users": count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const analyticsData = {
      kpis: {
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        totalUsers: userSignupsRes.data?.length || 0,
        activeCategories: Object.keys(categoryPerformance).length
      },
      categoryChartData,
      activityChartData,
      questionStats,
      leaderboardData: leaderboardRes.data || [],
      userSignupChartData,
    };
    
    return NextResponse.json(analyticsData);
  } catch (e: any) {
    console.error('Analytics API Error:', e);
    return new NextResponse(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
