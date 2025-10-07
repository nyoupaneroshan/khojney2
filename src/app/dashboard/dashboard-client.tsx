// src/app/dashboard/dashboard-client.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, User as UserIcon, CheckCircle2, AlertTriangle, BarChart3, 
    Award, Hash, Star, ChevronLeft, ChevronRight, Trophy, Flame, Target,
    TrendingUp, Calendar, Clock, Zap, BookOpen, Medal, ArrowUpRight
} from 'lucide-react';

// --- MOCK DATA & FUNCTIONS ---
const Link = ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>;
const supabase = { from: (table: string) => ({ update: (data: any) => ({ eq: (c: any, v: any) => Promise.resolve({ error: null }) }) }) };
// --- END MOCK ---

// --- TYPE DEFINITIONS ---
type User = { id: string; email?: string; user_metadata?: { full_name?: string } };

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  current_streak: number | null;
};

type Attempt = {
  id: string;
  score: number | null;
  status: string;
  completed_at: string | null;
  categories: { name_en: string } | null;
};

type Performance = {
  category_name: string;
  correct_answers: number | null;
  total_questions_answered: number | null;
};

type Achievement = {
  earned_at: string;
  achievements: {
    name: string;
    description: string | null;
    icon_url: string | null;
  } | null;
};

type OverallStats = {
  total_quizzes: number;
  total_questions: number;
  accuracy: number;
};

type Filters = { category: string; status: string; };

// --- ENHANCED UI COMPONENTS ---

const DashboardHeader = ({ name }: { name: string }) => {
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
            <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                    {greeting}, {name}! 👋
                </h1>
                <p className="text-lg text-gray-400 mt-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            <Link 
                href="/home" 
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 rounded-xl border border-gray-600 text-gray-200 hover:text-white transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                Back to Home
            </Link>
        </motion.div>
    );
};

const StatCard = ({ 
    icon, 
    title, 
    value, 
    colorClass, 
    trend, 
    trendValue,
    delay = 0 
}: { 
    icon: React.ReactNode; 
    title: string; 
    value: string | number; 
    colorClass: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    delay?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="group relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/80 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden"
    >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex items-start justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">{title}</p>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
                {trend && trendValue && (
                    <div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        <TrendingUp size={14} className={trend === 'down' ? 'rotate-180' : ''} />
                        {trendValue}
                    </div>
                )}
            </div>
            <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${colorClass} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
        </div>
    </motion.div>
);

const ProfileCard = ({ user, initialProfile }: { user: User, initialProfile: Profile | null }) => {
    const [fullName, setFullName] = useState(initialProfile?.full_name || '');
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdating(true);
        setMessage(null);
        const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
        if (error) setMessage({ text: 'Error updating profile.', type: 'error' });
        else setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setUpdating(false);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/80 rounded-2xl p-8 h-full flex flex-col shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-700/50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Your Profile</h2>
            </div>

            {/* Profile Display */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        {(initialProfile?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-xl text-white">{initialProfile?.full_name || 'No Name Set'}</p>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4 mt-auto">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-300 mb-2">
                        Update Display Name
                    </label>
                    <input 
                        id="fullName" 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        className="w-full px-4 py-3 text-white bg-gray-900/80 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                        placeholder="Enter your name"
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="w-full px-6 py-3 font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2" 
                    disabled={updating}
                >
                    {updating ? (
                        <>
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={18} />
                            Save Changes
                        </>
                    )}
                </button>

                <AnimatePresence>
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${
                                message.type === 'success' 
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                        >
                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </motion.div>
    );
};

const PerformanceCard = ({ performanceData }: { performanceData: Performance[] | null }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/80 rounded-2xl p-8 h-full shadow-xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Category Performance</h2>
                        <p className="text-sm text-gray-400">Track your progress by subject</p>
                    </div>
                </div>
            </div>

            {/* Performance Bars */}
            <div className="space-y-6">
                {!performanceData || performanceData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                            <BarChart3 className="w-10 h-10 text-gray-600" />
                        </div>
                        <p className="text-gray-400 font-semibold mb-2">No performance data yet</p>
                        <p className="text-sm text-gray-500">Start taking quizzes to see your progress!</p>
                    </div>
                ) : (
                    performanceData.map((p, index) => {
                        const percentage = (p.total_questions_answered || 0) > 0 
                            ? ((p.correct_answers || 0) / p.total_questions_answered!) * 100 
                            : 0;
                        const isExcellent = percentage >= 80;
                        const isGood = percentage >= 60 && percentage < 80;
                        
                        return (
                            <motion.div 
                                key={p.category_name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="group"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-white flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-cyan-400" />
                                        {p.category_name}
                                    </span>
                                    <div className="text-right">
                                        <span className={`font-bold text-lg ${
                                            isExcellent ? 'text-green-400' : 
                                            isGood ? 'text-yellow-400' : 
                                            'text-gray-400'
                                        }`}>
                                            {percentage.toFixed(0)}%
                                        </span>
                                        <p className="text-xs text-gray-500">
                                            {p.correct_answers} / {p.total_questions_answered} correct
                                        </p>
                                    </div>
                                </div>
                                <div className="relative w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                                        className={`h-3 rounded-full relative overflow-hidden ${
                                            isExcellent ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                                            isGood ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                                            'bg-gradient-to-r from-cyan-500 to-blue-600'
                                        }`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};

const AchievementsCard = ({ recentAchievements }: { recentAchievements: Achievement[] | null }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/80 rounded-2xl p-8 h-full shadow-xl hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-700/50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Achievements</h2>
                    <p className="text-sm text-gray-400">Your recent milestones</p>
                </div>
            </div>

            {/* Achievements List */}
            <div className="space-y-4">
                {!recentAchievements || recentAchievements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                            <Medal className="w-10 h-10 text-yellow-500/50" />
                        </div>
                        <p className="text-gray-400 font-semibold mb-1">No achievements yet</p>
                        <p className="text-sm text-gray-500">Complete quizzes to earn badges!</p>
                    </div>
                ) : (
                    recentAchievements.map(({ achievements, earned_at }, index) => achievements && (
                        <motion.div 
                            key={earned_at}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                <Award size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                                    {achievements.name}
                                </p>
                                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(earned_at).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <Zap className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

const QuizHistory = ({ initialAttempts }: { initialAttempts: Attempt[] }) => {
    const [filters, setFilters] = useState<Filters>({ category: 'all', status: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const ATTEMPTS_PER_PAGE = 5;

    const availableCategories = useMemo(() => 
        ['all', ...Array.from(new Set(initialAttempts.map(a => a.categories?.name_en).filter(Boolean)))], 
        [initialAttempts]
    );

    const filteredAttempts = useMemo(() => 
        initialAttempts.filter(attempt => 
            (filters.category === 'all' || attempt.categories?.name_en === filters.category) &&
            (filters.status === 'all' || attempt.status === filters.status)
        ), 
        [initialAttempts, filters]
    );

    const paginatedAttempts = useMemo(() => 
        filteredAttempts.slice((currentPage - 1) * ATTEMPTS_PER_PAGE, currentPage * ATTEMPTS_PER_PAGE), 
        [filteredAttempts, currentPage]
    );
    
    const totalPages = Math.ceil(filteredAttempts.length / ATTEMPTS_PER_PAGE);

    const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/80 rounded-2xl p-8 flex flex-col h-full shadow-xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Quiz History</h2>
                        <p className="text-sm text-gray-400">Review your past attempts</p>
                    </div>
                </div>
                {initialAttempts.length > 0 && (
                    <div className="px-4 py-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                        <p className="text-sm font-bold text-cyan-400">{filteredAttempts.length} Results</p>
                    </div>
                )}
            </div>

            {initialAttempts.length > 0 ? (
                <>
                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="category" className="block text-sm font-semibold text-gray-400 mb-2">
                                Category Filter
                            </label>
                            <select 
                                id="category" 
                                name="category" 
                                value={filters.category} 
                                onChange={handleFilterChange} 
                                className="w-full px-4 py-3 text-white bg-gray-900/80 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                            >
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? '📚 All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-semibold text-gray-400 mb-2">
                                Status Filter
                            </label>
                            <select 
                                id="status" 
                                name="status" 
                                value={filters.status} 
                                onChange={handleFilterChange} 
                                className="w-full px-4 py-3 text-white bg-gray-900/80 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                            >
                                <option value="all">🔄 All Statuses</option>
                                <option value="completed">✅ Completed</option>
                                <option value="started">⏳ In Progress</option>
                            </select>
                        </div>
                    </div>

                    {/* Quiz List */}
                    <div className="space-y-3 flex-grow min-h-[300px]">
                        <AnimatePresence mode="wait">
                            {paginatedAttempts.length > 0 ? (
                                paginatedAttempts.map((attempt, index) => (
                                    <motion.div
                                        key={attempt.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link 
                                            href={`/quiz/results/${attempt.id}`} 
                                            className="block p-5 rounded-xl bg-gray-900/70 border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-900/90 transition-all duration-300 group"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                        <BookOpen className="w-6 h-6 text-cyan-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
                                                            {attempt.categories?.name_en || 'General Quiz'}
                                                        </p>
                                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                                            <Calendar className="w-3 h-3" />
                                                            {attempt.completed_at 
                                                                ? new Date(attempt.completed_at).toLocaleDateString('en-US', { 
                                                                    month: 'short', 
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })
                                                                : 'In Progress'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right flex items-center gap-3">
                                                    {attempt.status === 'completed' ? (
                                                        <div className="text-right">
                                                            <p className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                                                {attempt.score ?? '-'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 font-semibold uppercase">Score</p>
                                                        </div>
                                                    ) : (
                                                        <span className="px-4 py-2 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                                            In Progress
                                                        </span>
                                                    )}
                                                    <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-center h-full py-16"
                                >
                                    <div className="text-center">
                                        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                            <Award className="w-10 h-10 text-gray-600" />
                                        </div>
                                        <p className="text-gray-400 font-semibold">No attempts match your filters</p>
                                        <p className="text-sm text-gray-500 mt-1">Try adjusting the filters above</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700/50">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                disabled={currentPage === 1} 
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-700/80 hover:bg-gray-600/80 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-white"
                            >
                                <ChevronLeft size={18} /> Previous
                            </button>
                            
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white">Page {currentPage}</span>
                                <span className="text-gray-500">of</span>
                                <span className="font-bold text-gray-400">{totalPages}</span>
                            </div>
                            
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                disabled={currentPage === totalPages} 
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-700/80 hover:bg-gray-600/80 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-white"
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 flex-grow">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                        <BookOpen className="w-12 h-12 text-cyan-400" />
                    </div>
                    <p className="text-xl font-bold text-white mb-2">No quiz history yet</p>
                    <p className="text-gray-400 mb-6">Start your learning journey today!</p>
                    <Link 
                        href="/categories" 
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/30"
                    >
                        <Zap size={18} />
                        Start Your First Quiz
                    </Link>
                </div>
            )}
        </motion.div>
    );
};

// Add Mail icon component
const Mail = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

// --- MAIN DASHBOARD CLIENT COMPONENT ---

export default function DashboardClient({
  user,
  initialProfile,
  initialAttempts,
  categoryPerformance,
  recentAchievements,
  overallStats
}: {
  user: User | null;
  initialProfile: Profile | null;
  initialAttempts: Attempt[];
  categoryPerformance?: Performance[] | null;
  recentAchievements?: Achievement[] | null;
  overallStats?: OverallStats | null;
}) {

  if (!user || !initialProfile) {
      return (
          <main className="min-h-screen w-full flex items-center justify-center p-6 sm:p-10 bg-gray-900 text-white">
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
              >
                  <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 font-semibold">Loading your dashboard...</p>
              </motion.div>
          </main>
      );
  }

  return (
    <main className="min-h-screen w-full p-6 sm:p-10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        <DashboardHeader name={initialProfile?.full_name || user.user_metadata?.full_name || 'Learner'} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard 
                icon={<Flame size={24} />} 
                title="Day Streak" 
                value={initialProfile?.current_streak || 0} 
                colorClass="bg-gradient-to-br from-orange-500 to-red-600" 
                trend="up"
                trendValue="+2 this week"
                delay={0.1}
            />
            <StatCard 
                icon={<Hash size={24} />} 
                title="Quizzes Taken" 
                value={overallStats?.total_quizzes || 0} 
                colorClass="bg-gradient-to-br from-blue-500 to-cyan-600" 
                delay={0.2}
            />
            <StatCard 
                icon={<Target size={24} />} 
                title="Overall Accuracy" 
                value={`${overallStats?.accuracy || 0}%`} 
                colorClass="bg-gradient-to-br from-green-500 to-emerald-600" 
                trend="up"
                trendValue="+5% vs last week"
                delay={0.3}
            />
            <StatCard 
                icon={<Trophy size={24} />} 
                title="Achievements" 
                value={recentAchievements?.length || 0} 
                colorClass="bg-gradient-to-br from-yellow-500 to-orange-600" 
                delay={0.4}
            />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile & Achievements */}
            <div className="lg:col-span-1 space-y-8">
                <ProfileCard user={user} initialProfile={initialProfile} />
                <AchievementsCard recentAchievements={recentAchievements ?? null} />
            </div>

            {/* Right Column - Performance & History */}
            <div className="lg:col-span-2 space-y-8">
                <PerformanceCard performanceData={categoryPerformance ?? null} />
                <QuizHistory initialAttempts={initialAttempts} />
            </div>
        </div>
      </div>
    </main>
  );
}
