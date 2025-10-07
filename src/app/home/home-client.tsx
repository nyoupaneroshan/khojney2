// src/app/home-client.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, LogOut, Search, Menu, X, BrainCircuit, ChevronRight, 
    UserCircle, Star, SortAsc, Users, BookOpen, Trophy, Zap, TrendingUp,
    Clock, Award, Filter, Grid3x3, List, Sparkles, ArrowRight, Target
} from 'lucide-react';
import Auth from '@/components/Auth';
import { Category, HierarchicalCategory } from '../types';
import { useAuth } from '@/components/AuthContext';

// --- Debounce Hook ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } 
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// =================================================================
// ENHANCED PRESENTATIONAL COMPONENTS
// =================================================================

const NavLinks = ({ onLogout, onLinkClick }: { onLogout: () => void; onLinkClick?: () => void }) => (
  <>
    <Link 
      href="/dashboard" 
      onClick={onLinkClick} 
      className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-gray-300 transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 hover:text-white font-medium"
    >
      <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
      <span>Dashboard</span>
    </Link>
    <button 
      onClick={() => { onLogout(); onLinkClick?.(); }} 
      className="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 font-medium"
    >
      <LogOut size={20} className="group-hover:scale-110 transition-transform" />
      <span>Logout</span>
    </button>
  </>
);

const MobileMenu = ({ isOpen, onLogout, closeMenu }: { isOpen: boolean; onLogout: () => void; closeMenu: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMenu}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 bottom-0 w-64 bg-gradient-to-br from-slate-800 to-slate-900 z-50 shadow-2xl md:hidden border-l border-slate-700"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">Menu</h3>
              <button 
                onClick={closeMenu}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <nav className="flex flex-col space-y-2">
              <NavLinks onLogout={onLogout} onLinkClick={closeMenu} />
            </nav>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const Header = ({ user, onLogout, onMenuToggle }: { user: User; onLogout: () => void; onMenuToggle: () => void }) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 18) return { text: 'Good afternoon', emoji: '🌤️' };
    return { text: 'Good evening', emoji: '🌙' };
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-50 mb-12"
    >
      <div className="flex justify-between items-center">
        {/* User Profile Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="User Avatar" 
                className="w-14 h-14 rounded-2xl border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20" 
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">
              {greeting.text} {greeting.emoji}
            </p>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner'}
            </h1>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLinks onLogout={onLogout} />
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onMenuToggle} 
          className="md:hidden p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
        >
          <Menu size={24} />
        </motion.button>
      </div>
    </motion.header>
  );
};

const SearchBar = ({ searchTerm, setSearchTerm }: { searchTerm: string, setSearchTerm: (term: string) => void }) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
    className="relative mb-10 max-w-2xl mx-auto"
  >
    <div className="relative group">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none z-10" size={22} />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for exams, subjects, or topics..."
        className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700 rounded-2xl py-4 pl-14 pr-12 text-white placeholder-slate-400
                   focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/30 transition-all duration-300 shadow-xl backdrop-blur-sm
                   hover:border-slate-600"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
      
      <AnimatePresence>
        {searchTerm && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-all z-10"
          >
            <X size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

type SortOrder = 'alphabetical' | 'popular';
type ViewMode = 'grid' | 'list';

const FilterControls = ({ 
  sortOrder, 
  setSortOrder,
  viewMode,
  setViewMode,
  resultsCount 
}: { 
  sortOrder: SortOrder; 
  setSortOrder: (order: SortOrder) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  resultsCount: number;
}) => {
  const filterButton = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300";
  const activeFilter = "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30";
  const inactiveFilter = "bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 border border-slate-700";
  
  return (
    <motion.div 
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10 p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm"
    >
      {/* Sort Options */}
      <div className="flex items-center gap-3">
        <Filter className="text-slate-400" size={20} />
        <div className="flex gap-2">
          <button 
            onClick={() => setSortOrder('alphabetical')} 
            className={`${filterButton} ${sortOrder === 'alphabetical' ? activeFilter : inactiveFilter}`}
          >
            <SortAsc size={16} /> A-Z
          </button>
          <button 
            onClick={() => setSortOrder('popular')} 
            className={`${filterButton} ${sortOrder === 'popular' ? activeFilter : inactiveFilter}`}
          >
            <TrendingUp size={16} /> Popular
          </button>
        </div>
      </div>

      {/* Results Count & View Toggle */}
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <p className="text-sm font-semibold text-slate-300">
            <span className="text-cyan-400">{resultsCount}</span> Exams
          </p>
        </div>
        
        <div className="flex gap-1 p-1 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedExams = ({ categories }: { categories: Category[] }) => (
  <motion.div 
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
    className="mb-12"
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
          <Star className="text-yellow-400" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Featured Exams</h2>
          <p className="text-sm text-slate-400">Most popular among students</p>
        </div>
      </div>
      <Sparkles className="text-yellow-400 animate-pulse" size={20} />
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category, index) => (
        <Link key={category.id} href={`/category/${category.slug}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 cursor-pointer overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
                {category.name_en}
              </h3>
              {category.name_ne && (
                <p className="text-xs text-slate-400">{category.name_ne}</p>
              )}
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  </motion.div>
);

const SubCategoryList = ({ subCategories }: { subCategories: HierarchicalCategory[] }) => (
  <div className="bg-gradient-to-br from-black/30 to-black/10 px-6 py-5 border-t border-slate-700/60 rounded-b-2xl backdrop-blur-sm">
    <div className="flex items-center gap-2 mb-4">
      <Target className="w-4 h-4 text-cyan-400" />
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
        Topics Covered ({subCategories.length})
      </h3>
    </div>
    <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
      {subCategories.map((sub, index) => (
        <motion.li 
          key={sub.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ x: 4 }}
        >
          <Link
            href={`/category/${sub.slug}`}
            className="flex items-center justify-between p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-all group"
          >
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400" />
              {sub.name_en}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-all group-hover:translate-x-1" />
          </Link>
        </motion.li>
      ))}
    </ul>
  </div>
);

const CategoryCard = ({ category, viewMode }: { category: HierarchicalCategory; viewMode: ViewMode }) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        variants={itemVariants}
        whileHover={{ x: 5 }}
        className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/60 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden backdrop-blur-sm group"
      >
        <Link href={`/category/${category.slug}`}>
          <div className="p-6 flex items-center gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <BrainCircuit className="h-8 w-8 text-cyan-400" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                {category.name_en}
              </h2>
              {category.name_ne && (
                <p className="text-sm text-slate-400 font-light mb-2">{category.name_ne}</p>
              )}
              {category.description_en && (
                <p className="text-slate-400 text-sm font-light leading-relaxed line-clamp-2">
                  {category.description_en}
                </p>
              )}
            </div>

            <div className="flex-shrink-0 flex items-center gap-4">
              {category.subCategories.length > 0 && (
                <div className="px-4 py-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                  <p className="text-xs font-bold text-cyan-400">
                    {category.subCategories.length} Topics
                  </p>
                </div>
              )}
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/60 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 relative overflow-hidden backdrop-blur-sm group flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6 flex-grow">
        <Link href={`/category/${category.slug}`} className="block">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <BrainCircuit className="h-7 w-7 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                {category.name_en}
              </h2>
              {category.name_ne && (
                <p className="text-sm text-slate-400 font-light">{category.name_ne}</p>
              )}
            </div>
          </div>
          
          {category.description_en && (
            <p className="text-slate-400 text-sm font-light leading-relaxed line-clamp-3 mb-4">
              {category.description_en}
            </p>
          )}

          {category.subCategories.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
              <BookOpen size={14} />
              <span>{category.subCategories.length} Topics Available</span>
            </div>
          )}
        </Link>
      </div>

      {category.subCategories.length > 0 && (
        <SubCategoryList subCategories={category.subCategories} />
      )}
    </motion.div>
  );
};

const EmptyState = ({ searchTerm }: { searchTerm: string }) => (
  <motion.div
    key="no-results"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="text-center py-20 px-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 shadow-2xl mt-8 backdrop-blur-sm"
  >
    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
      <Search className="w-12 h-12 text-slate-500" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-2">No Exams Found</h3>
    <p className="text-slate-400 max-w-md mx-auto mb-6">
      We couldn't find any exams matching <span className="text-cyan-400 font-semibold">"{searchTerm}"</span>. 
      Try adjusting your search or explore our featured exams.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/30"
    >
      <Sparkles size={18} />
      Browse All Exams
    </button>
  </motion.div>
);

// =================================================================
// MAIN CLIENT COMPONENT
// =================================================================

export default function HomeClient({ 
  session, 
  initialCategories 
}: { 
  session: Session | null; 
  initialCategories: Category[] 
}) {
  const { session: authSession, loadingAuth } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('alphabetical');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const finalSession = session || authSession;
  
  // Filtered categories logic (unchanged)
  const filteredCategories = useMemo(() => {
    if (!debouncedSearchTerm) {
      return initialCategories;
    }
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    const categoryMap = new Map(initialCategories.map(c => [c.id, c]));
    const includedIds = new Set<string>();
    
    initialCategories.forEach(category => {
      if (
        category.name_en.toLowerCase().includes(lowercasedTerm) ||
        (category.name_ne && category.name_ne.toLowerCase().includes(lowercasedTerm)) ||
        (category.description_en && category.description_en.toLowerCase().includes(lowercasedTerm))
      ) {
        let current: Category | undefined = category;
        while (current) {
          includedIds.add(current.id);
          if (current.parent_category_id && categoryMap.has(current.parent_category_id)) {
            current = categoryMap.get(current.parent_category_id)!;
          } else {
            current = undefined;
          }
        }
      }
    });
    
    return initialCategories.filter(c => includedIds.has(c.id));
  }, [debouncedSearchTerm, initialCategories]);

  // Hierarchical categories with sorting (unchanged logic)
  const hierarchicalCategories = useMemo(() => {
    const categoryMap = new Map<string, HierarchicalCategory>();
    const topLevelCategories: HierarchicalCategory[] = [];
    
    filteredCategories.forEach(category => {
      categoryMap.set(category.id, { ...category, subCategories: [] });
    });
    
    const filteredAndMappedCategories = Array.from(categoryMap.values()).filter(c => {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      return !debouncedSearchTerm ||
             c.name_en.toLowerCase().includes(lowercasedTerm) ||
             (c.name_ne && c.name_ne.toLowerCase().includes(lowercasedTerm)) ||
             (c.description_en && c.description_en.toLowerCase().includes(lowercasedTerm));
    });
    
    filteredAndMappedCategories.forEach(category => {
      if (category.parent_category_id && categoryMap.has(category.parent_category_id)) {
        const parent = categoryMap.get(category.parent_category_id)!;
        if (!parent.subCategories.some(sub => sub.id === category.id)) {
          parent.subCategories.push(category);
        }
      } else {
        if (!topLevelCategories.some(t => t.id === category.id)) {
          topLevelCategories.push(category);
        }
      }
    });
    
    categoryMap.forEach(cat => {
      cat.subCategories.sort((a, b) => a.name_en.localeCompare(b.name_en));
    });
    
    topLevelCategories.sort((a, b) => {
      if (sortOrder === 'popular') {
        return b.subCategories.length - a.subCategories.length;
      }
      return a.name_en.localeCompare(b.name_en);
    });

    return topLevelCategories;
  }, [filteredCategories, debouncedSearchTerm, sortOrder]);

  // Featured exams (unchanged)
  const featuredExams = useMemo(() => {
    const featuredSlugs = ['cmat', 'physics', 'chemistry', 'general-knowledge'];
    return initialCategories
      .filter(c => featuredSlugs.includes(c.slug))
      .sort((a, b) => featuredSlugs.indexOf(a.slug) - featuredSlugs.indexOf(b.slug));
  }, [initialCategories]);

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
  };
  
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  
  return (
    <main className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white font-sans flex flex-col items-center py-8 px-4 sm:px-6 md:px-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-40 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="mx-auto max-w-7xl w-full z-10">
        <AnimatePresence mode="wait">
          {loadingAuth ? (
            <motion.div 
              key="loading" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[80vh] text-slate-400"
            >
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-lg font-semibold">Loading your dashboard...</p>
            </motion.div>
          ) : !finalSession ? (
            <motion.div 
              key="auth" 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-center min-h-[80vh]"
            >
              <Auth />
            </motion.div>
          ) : (
            <motion.div 
              key="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Header 
                user={finalSession.user} 
                onLogout={handleLogout} 
                onMenuToggle={toggleMobileMenu} 
              />
              
              <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onLogout={handleLogout} 
                closeMenu={() => setMobileMenuOpen(false)} 
              />

              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

              {!debouncedSearchTerm && featuredExams.length > 0 && (
                <FeaturedExams categories={featuredExams} />
              )}
              
              <FilterControls 
                sortOrder={sortOrder} 
                setSortOrder={setSortOrder}
                viewMode={viewMode}
                setViewMode={setViewMode}
                resultsCount={hierarchicalCategories.length}
              />
              
              <AnimatePresence mode="wait">
                {hierarchicalCategories.length > 0 ? (
                  <motion.div
                    layout
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={
                      viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        : "flex flex-col gap-4"
                    }
                  >
                    {hierarchicalCategories.map((category) => (
                      <CategoryCard 
                        key={category.id} 
                        category={category}
                        viewMode={viewMode}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState searchTerm={searchTerm} />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Scrollbar Styles */}
           {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #2563eb);
        }

        /* Blob animations */
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
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

        /* Line clamp utilities */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}
