// src/app/admin/questions/manage-questions-client.tsx

'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Search, ChevronsUpDown, CheckCircle2, EyeOff, BookOpen, HelpCircle } from 'lucide-react';
import QuestionForm from './QuestionForm';

// --- Interfaces ---
interface Question {
  id: string;
  question_text_en: string;
  is_published: boolean;
  created_at: string;
  question_categories: { categories: { name_en: string } | null }[];
}
interface Category {
  id: string;
  name_en: string;
}

const StatCard = ({ icon, title, value, colorClass }: { icon: React.ReactNode, title: string, value: number, colorClass: string }) => (
    <div className="bg-gray-800/50 border border-gray-700/80 rounded-xl p-5">
      <div className="flex items-center gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
);

export default function ManageQuestionsClient({ initialQuestions, initialCategories }: { initialQuestions: Question[], initialCategories: Category[] }) {
  const router = useRouter();
  
  // Data state is now initialized from server props
  const [questions, setQuestions] = useState(initialQuestions);
  const [allCategories] = useState(initialCategories);

  // All other interactive state remains here
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Question; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Handlers
  const handleEdit = async (question: Question) => {
    try {
      const { data, error } = await supabase.from('questions').select(`*, options (*), question_categories (category_id)`).eq('id', question.id).single();
      if (error) throw error;
      setEditingQuestion(data);
      setShowForm(true);
    } catch (error) {
      console.error("Error fetching full question details for editing:", error);
    }
  };

  const handleCreateNew = () => {
    setEditingQuestion(null);
    setShowForm(true);
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
  };
  
  const handleSave = () => {
    setShowForm(false);
    setEditingQuestion(null);
    router.refresh();
  };

  // Stats calculation
  const stats = useMemo(() => {
    const published = questions.filter(q => q.is_published).length;
    return {
      total: questions.length,
      published,
      drafts: questions.length - published
    };
  }, [questions]);

  // Sorting and filtering logic
  const sortedAndFilteredQuestions = useMemo(() => {
    let filtered = questions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question_text_en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => 
        statusFilter === 'published' ? q.is_published : !q.is_published
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [questions, searchTerm, statusFilter, sortConfig]);

  // Pagination logic
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAndFilteredQuestions, currentPage]);

  const totalPages = Math.ceil(sortedAndFilteredQuestions.length / ITEMS_PER_PAGE);

  const requestSort = (key: keyof Question) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  return (
    <>
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/60 z-40" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-gray-900 shadow-2xl z-50 border-l border-gray-700 overflow-y-auto"
            >
              <QuestionForm question={editingQuestion} allCategories={allCategories} onSave={handleSave} onCancel={handleCancel} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <main className="w-full p-8 sm:p-12 bg-gray-900 text-white min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
              <ArrowLeft size={16} /> Back to Admin Dashboard
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
            <h1 className="text-4xl font-bold">Question Management</h1>
            <button 
              onClick={handleCreateNew} 
              className="inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-5 rounded-lg transition-colors"
            >
              <Plus size={18} /> New Question
            </button>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<BookOpen size={22} />} title="Total Questions" value={stats.total} colorClass="bg-purple-500/20 text-purple-300" />
            <StatCard icon={<CheckCircle2 size={22} />} title="Published" value={stats.published} colorClass="bg-green-500/20 text-green-300" />
            <StatCard icon={<EyeOff size={22} />} title="Drafts" value={stats.drafts} colorClass="bg-yellow-500/20 text-yellow-300" />
          </motion.div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search questions..." 
                value={searchTerm} 
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" 
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }} 
              className="bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors" onClick={() => requestSort('question_text_en')}>
                      <div className="flex items-center gap-2">Question <ChevronsUpDown size={14} /></div>
                    </th>
                    <th className="p-4">Categories</th>
                    <th className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors" onClick={() => requestSort('is_published')}>
                      <div className="flex items-center gap-2">Status <ChevronsUpDown size={14} /></div>
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors hidden md:table-cell" onClick={() => requestSort('created_at')}>
                      <div className="flex items-center gap-2">Created <ChevronsUpDown size={14} /></div>
                    </th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuestions.length > 0 ? (
                    paginatedQuestions.map(question => (
                      <tr key={question.id} className="border-t border-gray-700/50 hover:bg-gray-700/50">
                        <td className="p-4 font-semibold">{question.question_text_en.substring(0, 60)}...</td>
                        <td className="p-4 text-gray-400">
                          {question.question_categories.map(qc => qc.categories?.name_en).filter(Boolean).join(', ') || 'N/A'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${question.is_published ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                            {question.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 hidden md:table-cell">{new Date(question.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleEdit(question)} className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
                            <Edit size={14} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center text-gray-500 py-16">No questions found matching your criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 text-sm">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 rounded-md disabled:opacity-50 hover:bg-gray-700/100 transition-colors"
              >
                Previous
              </button>
              <span className="font-semibold text-gray-300">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages} 
                className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 rounded-md disabled:opacity-50 hover:bg-gray-700/100 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
