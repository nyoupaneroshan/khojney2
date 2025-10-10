// src/app/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthContext';
import AiPlanModal from '@/components/AiPlanModal';

import {
    BrainCircuit, BookOpenText, Target, BarChart, X, Menu, ChevronDown,
    ArrowRight, UserIcon, Lock, AtSign, CheckCircle2, AlertTriangle,
    Sparkles, Zap, Users, Award, Star, Globe, Rocket, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Animation Variants ---
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

// --- Reusable AnimatedSection Component ---
const AnimatedSection = ({
    children,
    className = '',
    delay = 0
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// --- Google Icon ---
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.131,44,30.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

// --- Advanced Auth Component ---
const AdvancedAuth = ({ initialMode = 'login' }: { initialMode: 'login' | 'signup' }) => {
    const [authMode, setAuthMode] = useState(initialMode);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => { setAuthMode(initialMode); setMessage(null); }, [initialMode]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setMessage({ text: error.message, type: 'error' });
            setLoading(false);
        } else {
            setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
            setTimeout(() => { window.location.href = '/home'; }, 1500);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        });
        if (error) {
            setMessage({ text: error.message, type: 'error' });
        } else {
            setMessage({ text: 'Signup successful! Please check your email.', type: 'success' });
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setMessage(null);
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` }
        });
    };

    const formVariants = { hidden: { opacity: 0, x: 25 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -25 } };
    const inputIconClasses = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500";

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl shadow-2xl border border-slate-700/60 backdrop-blur-xl">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <BrainCircuit className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">
                    {authMode === 'login' ? 'Welcome Back!' : 'Join Khojney'}
                </h1>
                <p className="text-gray-400 mt-2">
                    {authMode === 'login' ? 'Continue your learning journey' : 'Start your exam prep today'}
                </p>
            </div>

            <div className="flex bg-slate-900/50 p-1 rounded-full border border-slate-700">
                <button
                    onClick={() => setAuthMode('login')}
                    className={`w-1/2 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${authMode === 'login'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-slate-700/50'
                        }`}
                >
                    Login
                </button>
                <button
                    onClick={() => setAuthMode('signup')}
                    className={`w-1/2 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${authMode === 'signup'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-slate-700/50'
                        }`}
                >
                    Sign Up
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.form
                    key={authMode}
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    onSubmit={authMode === 'login' ? handleLogin : handleSignup}
                    className="space-y-4"
                >
                    {authMode === 'signup' && (
                        <div className="relative">
                            <UserIcon className={inputIconClasses} />
                            <input
                                id="fullName-signup"
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                required
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 text-white bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <AtSign className={inputIconClasses} />
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 text-white bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Lock className={inputIconClasses} />
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 text-white bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (authMode === 'login' ? 'Login' : 'Create Account')}
                    </button>
                </motion.form>
            </AnimatePresence>

            <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or</span>
                <div className="flex-grow border-t border-slate-600"></div>
            </div>

            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 font-semibold text-white bg-slate-700/50 rounded-xl border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all disabled:opacity-50"
            >
                <GoogleIcon />
                Sign in with Google
            </button>

            {message && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 flex items-center justify-center gap-2 text-center text-sm p-3 rounded-xl ${message.type === 'success'
                        ? 'text-green-400 bg-green-500/10 border border-green-500/30'
                        : 'text-red-400 bg-red-500/10 border border-red-500/30'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {message.text}
                </motion.p>
            )}
        </div>
    );
};

// --- Navbar Component ---
const Navbar = ({
    onLoginClick,
    onRegisterClick
}: {
    onLoginClick: () => void;
    onRegisterClick: () => void;
}) => {
    const { session } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const isAuthenticated = !!session;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/60 shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link
                        href={isAuthenticated ? "/home" : "/"}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <BrainCircuit size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Khojney
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-2">
                        <a
                            href="#features"
                            className="px-4 py-2 rounded-xl font-medium transition-all text-gray-300 hover:bg-slate-800 hover:text-white"
                        >
                            Features
                        </a>
                        <a
                            href="#ai-planner"
                            className="px-4 py-2 rounded-xl font-medium transition-all text-gray-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                        >
                            <Sparkles size={16} className="text-yellow-400" />
                            AI Planner
                        </a>
                        <a
                            href="#faq"
                            className="px-4 py-2 rounded-xl font-medium transition-all text-gray-300 hover:bg-slate-800 hover:text-white"
                        >
                            FAQ
                        </a>
                    </nav>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link
                                href="/home"
                                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 shadow-lg hover:shadow-cyan-500/30 transition-all"
                            >
                                Go to App
                                <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <div className="hidden md:flex items-center space-x-3">
                                <button
                                    onClick={onLoginClick}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-gray-300 hover:text-white hover:bg-slate-800 transition-all"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={onRegisterClick}
                                    className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg hover:shadow-cyan-500/30 transition-all"
                                >
                                    Get Started
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-4 pb-4 space-y-2"
                        >
                            <a
                                href="#features"
                                className="block px-4 py-3 rounded-xl font-medium text-gray-300 hover:bg-slate-800 hover:text-white transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </a>
                            <a
                                href="#ai-planner"
                                className="block px-4 py-3 rounded-xl font-medium text-gray-300 hover:bg-slate-800 hover:text-white transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                ✨ AI Planner
                            </a>
                            <a
                                href="#faq"
                                className="block px-4 py-3 rounded-xl font-medium text-gray-300 hover:bg-slate-800 hover:text-white transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                FAQ
                            </a>
                            {!isAuthenticated && (
                                <>
                                    <button
                                        onClick={() => {
                                            onLoginClick();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-3 rounded-xl font-medium text-gray-300 hover:bg-slate-800 hover:text-white transition-all"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => {
                                            onRegisterClick();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="block w-full px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 transition-all"
                                    >
                                        Get Started
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
};

// --- Hero Section ---
const HeroSection = ({ onRegisterClick }: { onRegisterClick: () => void }) => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-4xl mx-auto text-center"
            >
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-8">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-cyan-400">Nepal's #1 Exam Prep Platform</span>
                </motion.div>

                <motion.h1
                    variants={fadeInUp}
                    className="text-5xl md:text-7xl font-black text-white leading-tight mb-6"
                >
                    Master Your{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                        Exam Journey
                    </span>
                </motion.h1>

                <motion.p
                    variants={fadeInUp}
                    className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto"
                >
                    Ace Loksewa, CMAT, and entrance exams with AI-powered study plans,
                    thousands of practice questions, and real-time progress tracking.
                </motion.p>

                <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <button
                        onClick={onRegisterClick}
                        className="group w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-cyan-500 hover:to-blue-500 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        Get Started Free
                        <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                        href="#ai-planner"
                        className="group w-full sm:w-auto bg-slate-800/50 backdrop-blur-sm text-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-700/50 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        Try AI Planner
                    </a>
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
                >
                    {[
                        { number: '10K+', label: 'Active Students' },
                        { number: '50K+', label: 'Practice Questions' },
                        { number: '95%', label: 'Success Rate' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                {stat.number}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2"
            >
                <div className="w-1.5 h-2 bg-cyan-400 rounded-full" />
            </motion.div>
        </motion.div>
    </section>
);

// --- Features Section ---
const FeaturesSection = () => {
    const features = [
        {
            icon: <BookOpenText className="w-8 h-8" />,
            title: "50,000+ Questions",
            description: "Comprehensive question bank covering all major exams in Nepal",
            color: "from-cyan-500 to-blue-600"
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Bilingual Support",
            description: "Practice in both Nepali and English with verified translations",
            color: "from-purple-500 to-pink-600"
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: "Syllabus Aligned",
            description: "Questions organized by official exam syllabi and topics",
            color: "from-green-500 to-emerald-600"
        },
        {
            icon: <BarChart className="w-8 h-8" />,
            title: "Smart Analytics",
            description: "Track your progress with detailed performance insights",
            color: "from-orange-500 to-red-600"
        },
        {
            icon: <Sparkles className="w-8 h-8" />,
            title: "AI Study Plans",
            description: "Get personalized study schedules powered by AI",
            color: "from-yellow-500 to-orange-600"
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Community Learning",
            description: "Join thousands of students on the same journey",
            color: "from-blue-500 to-cyan-600"
        }
    ];

    return (
        <section id="features" className="py-24 bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <AnimatedSection className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="inline-block p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-4"
                    >
                        <Award className="w-8 h-8 text-cyan-400" />
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Everything You Need to{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Succeed
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        A complete learning platform built specifically for Nepali students
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <AnimatedSection key={i} delay={i * 0.1}>
                            <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group relative p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/60 hover:border-cyan-500/50 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative z-10">
                                    <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                                        {React.cloneElement(feature.icon, { className: 'w-8 h-8 text-white' })}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- AI Planner Section ---
const AiPlannerSection = ({ onPlanGenerated }: { onPlanGenerated: (plan: string) => void }) => {
    const [exam, setExam] = useState('Loksewa (Officer)');
    const [weeks, setWeeks] = useState(8);
    const [hours, setHours] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    const generatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!weeks || !hours) {
            alert('Please fill in both weeks and hours.');
            return;
        }
        setIsLoading(true);

        const prompt = `You are an expert academic advisor for students in Nepal preparing for competitive exams. A student is preparing for the "${exam}" exam. They have ${weeks} weeks to prepare and can study for ${hours} hours per week. Create a concise, actionable, and encouraging weekly study plan for them. The plan should be broken down by week. For each week, suggest key topics to cover (be specific to the exam they selected), a study strategy (e.g., focus on practice questions, review concepts), and a motivational tip. The output must be in simple Markdown format. Use headings for each week (e.g., ### Week 1: ...). Do not include any introductory or concluding sentences outside of the plan itself. Separate each week's plan with a horizontal rule (---).`;

        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) throw new Error("API Key not found.");

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`API error: ${response.statusText} - ${errorBody.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                onPlanGenerated(result.candidates[0].content.parts[0].text);
            } else {
                throw new Error('No content received from API.');
            }
        } catch (error: any) {
            console.error("Error calling Gemini API:", error);
            onPlanGenerated(`<p class="text-red-400">An error occurred: ${error.message}</p>`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="ai-planner" className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <AnimatedSection className="container mx-auto px-6 relative z-10">
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl shadow-2xl border border-slate-700/60 backdrop-blur-sm p-8 md:p-12">
                    <div className="lg:flex items-center gap-12">
                        <div className="lg:w-1/2 mb-8 lg:mb-0">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-6">
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-semibold text-yellow-400">Powered by AI</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Personal</span> Study Plan
                            </h2>
                            <p className="text-xl text-gray-400 leading-relaxed">
                                Get a customized, week-by-week study schedule tailored to your exam and timeline. Our AI analyzes your goals and creates an actionable plan in seconds.
                            </p>

                            <div className="mt-8 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Free & Instant</h4>
                                    <p className="text-sm text-gray-400">Generate unlimited study plans at no cost</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2">
                            <form onSubmit={generatePlan} className="space-y-6">
                                <div>
                                    <label htmlFor="exam" className="block text-sm font-semibold text-gray-300 mb-2">
                                        Select Your Exam
                                    </label>
                                    <select
                                        id="exam"
                                        value={exam}
                                        onChange={(e) => setExam(e.target.value)}
                                        className="w-full px-4 py-3 text-white bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                                    >
                                        <option>Loksewa (Officer)</option>
                                        <option>Loksewa (Kharidar/Subba)</option>
                                        <option>CMAT</option>
                                        <option>Medical Entrance (MBBS/BDS)</option>
                                        <option>Engineering Entrance (IOE)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="weeks" className="block text-sm font-semibold text-gray-300 mb-2">
                                            Weeks to Exam
                                        </label>
                                        <input
                                            type="number"
                                            id="weeks"
                                            value={weeks}
                                            onChange={(e) => setWeeks(Number(e.target.value))}
                                            min="1"
                                            max="52"
                                            className="w-full px-4 py-3 text-white bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                            placeholder="e.g., 8"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="hours" className="block text-sm font-semibold text-gray-300 mb-2">
                                            Hours/Week
                                        </label>
                                        <input
                                            type="number"
                                            id="hours"
                                            value={hours}
                                            onChange={(e) => setHours(Number(e.target.value))}
                                            min="1"
                                            max="100"
                                            className="w-full px-4 py-3 text-white bg-slate-700/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                            placeholder="e.g., 10"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-orange-500 disabled:from-slate-600 disabled:to-slate-700 transition-all duration-300 shadow-lg hover:shadow-yellow-500/30"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating Your Plan...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Generate My Study Plan
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        </section>
    );
};

// --- FAQ Section ---
const FaqItem = ({
    question,
    answer,
    isOpen,
    onClick
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}) => (
    <div className="border-b border-slate-700/60 py-6">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left group"
        >
            <span className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                {question}
            </span>
            <ChevronDown
                className={`w-5 h-5 text-cyan-400 transform transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''
                    }`}
            />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <p className="mt-4 text-gray-400 leading-relaxed">{answer}</p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const FaqSection = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqs = [
        {
            q: 'Is Khojney free to use?',
            a: 'Yes! Khojney offers a generous free tier with access to thousands of practice questions. For unlimited access and advanced features like detailed analytics and premium study materials, we offer affordable premium plans.'
        },
        {
            q: 'Is the content available in Nepali?',
            a: 'Absolutely! We provide high-quality content in both Nepali and English. All questions are carefully verified and translated to ensure accuracy in both languages.'
        },
        {
            q: 'How are the questions verified?',
            a: 'Our questions are sourced from official exam papers, reputable textbooks, and verified by subject matter experts. We use OCR technology combined with manual review to ensure the highest quality.'
        },
        {
            q: 'Can I track my progress?',
            a: 'Yes! Khojney provides comprehensive analytics including performance by category, accuracy rates, time management insights, and personalized recommendations to improve your scores.'
        }
    ];

    return (
        <section id="faq" className="py-24 bg-slate-900">
            <div className="container mx-auto px-6">
                <AnimatedSection className="text-center mb-16">
                    <div className="inline-block p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-4">
                        <Shield className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Frequently Asked{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Questions
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Everything you need to know about Khojney
                    </p>
                </AnimatedSection>

                <AnimatedSection className="max-w-3xl mx-auto">
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/60 p-8">
                        {faqs.map((faq, index) => (
                            <FaqItem
                                key={index}
                                question={faq.q}
                                answer={faq.a}
                                isOpen={openFaq === index}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            />
                        ))}
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
};

// --- CTA Section ---
const CtaSection = ({ onRegisterClick }: { onRegisterClick: () => void }) => (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl" />
        </div>

        <AnimatedSection className="container mx-auto px-6 text-center relative z-10">
            <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-block p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-6"
            >
                <Rocket className="w-10 h-10 text-cyan-400" />
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                Ready to Start Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Success Story?
                </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
                Join over 10,000 students who are already preparing for their dream careers with Khojney
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                    onClick={onRegisterClick}
                    className="group w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:from-cyan-500 hover:to-blue-500 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                    Start Learning Today
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-gray-400">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>No credit card required</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Cancel anytime</span>
                </div>
            </div>
        </AnimatedSection>
    </section>
);

// --- Footer ---
const Footer = () => (
    <footer className="bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <BrainCircuit size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Khojney
                        </span>
                    </div>
                    <p className="text-gray-400 max-w-md mb-4">
                        Nepal's leading exam preparation platform. Helping students achieve their dreams through quality education and technology.
                    </p>
                    <div className="flex gap-4">
                        {/* Add social media icons here if needed */}
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
                        <li><a href="#ai-planner" className="hover:text-cyan-400 transition-colors">AI Planner</a></li>
                        <li><a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">Legal</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Us</a></li>
                    </ul>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
                <p className="text-gray-500">
                    &copy; {new Date().getFullYear()} Khojney. All rights reserved. Made with ❤️ in Nepal
                </p>
            </div>
        </div>
    </footer>
);

// --- Main Component ---
export default function HomePage() {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
    const [planResult, setPlanResult] = useState('');
    const [showAiModal, setShowAiModal] = useState(false);

    const handleOpenAuthModal = (mode: 'login' | 'signup') => {
        setAuthInitialMode(mode);
        setAuthModalOpen(true);
    };

    const handlePlanGenerated = (markdown: string) => {
        setPlanResult(markdown);
        setShowAiModal(true);
    };

    return (
        <div className="bg-slate-900">
            <Navbar
                onLoginClick={() => handleOpenAuthModal('login')}
                onRegisterClick={() => handleOpenAuthModal('signup')}
            />
            <main>
                <HeroSection onRegisterClick={() => handleOpenAuthModal('signup')} />
                <FeaturesSection />
                <AiPlannerSection onPlanGenerated={handlePlanGenerated} />
                <FaqSection />
                <CtaSection onRegisterClick={() => handleOpenAuthModal('signup')} />
            </main>
            <Footer />

            <AnimatePresence>
                {isAuthModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setAuthModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AdvancedAuth initialMode={authInitialMode} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAiModal && (
                    <AiPlanModal
                        markdownContent={planResult}
                        onClose={() => setShowAiModal(false)}
                        onRegisterClick={() => {
                            setShowAiModal(false);
                            handleOpenAuthModal('signup');
                        }}
                    />
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
