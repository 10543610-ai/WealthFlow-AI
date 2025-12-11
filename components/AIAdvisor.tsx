import React, { useState } from 'react';
import { AppData } from '../types';
import { analyzeFinances } from '../services/geminiService';
import { Bot, Sparkles, X } from 'lucide-react';

interface AIAdvisorProps {
  data: AppData;
  isOpen: boolean;
  onClose: () => void;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ data, isOpen, onClose }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis("AI 正在分析您的財務數據...");
    const result = await analyzeFinances(data);
    setAnalysis(result);
    setLoading(false);
    setHasAnalyzed(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      <div className="fixed inset-0 bg-black/20 pointer-events-auto" onClick={onClose}></div>
      <div className="w-full md:w-[400px] h-full bg-white shadow-2xl p-6 overflow-y-auto pointer-events-auto flex flex-col animate-slide-in-right transform transition-transform duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-blue-600">
            <Bot size={28} />
            <h2 className="text-xl font-bold">AI 財務顧問</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1">
          {!hasAnalyzed ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-full text-blue-500">
                <Sparkles size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">準備好進行財務健檢了嗎？</h3>
              <p className="text-gray-500 text-sm px-4">
                Gemini AI 將分析您的資產配置、消費習慣與持股狀況，並提供個人化的理財建議。
              </p>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition transform"
              >
                {loading ? '分析中...' : '開始分析'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                  {analysis}
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg transition"
              >
                {loading ? '更新分析中...' : '重新分析'}
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Powered by Google Gemini</p>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;