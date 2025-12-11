import React, { useState } from 'react';
import { Transaction, TransactionType, BankAccount, CATEGORIES } from '../types';
import { Plus, Search, Filter } from 'lucide-react';
import { suggestCategory } from '../services/geminiService';

interface TransactionManagerProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  accounts: BankAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ 
  transactions, 
  setTransactions,
  accounts,
  setAccounts
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    accountId: accounts[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: TransactionType.EXPENSE,
    category: CATEGORIES[0],
    description: ''
  });

  const handleDescriptionBlur = async () => {
    if (formData.description && formData.description.length > 1) {
      setIsAutoCategorizing(true);
      const suggested = await suggestCategory(formData.description);
      if (suggested && CATEGORIES.includes(suggested)) {
        setFormData(prev => ({ ...prev, category: suggested }));
      }
      setIsAutoCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      ...formData,
      id: Date.now().toString(),
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === formData.accountId) {
        const adjustment = formData.type === TransactionType.INCOME 
          ? formData.amount 
          : -formData.amount;
        return { ...acc, balance: acc.balance + adjustment };
      }
      return acc;
    }));

    setIsModalOpen(false);
    setFormData({
      accountId: accounts[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      type: TransactionType.EXPENSE,
      category: CATEGORIES[0],
      description: ''
    });
  };

  const filteredTransactions = transactions
    .filter(t => filter === 'ALL' || t.category === filter)
    .filter(t => t.description.includes(searchTerm) || t.amount.toString().includes(searchTerm));

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || '未知帳戶';

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">財務紀錄管理</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full md:w-auto justify-center"
        >
          <Plus size={18} /> 新增收支
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜尋交易描述或金額..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">所有分類</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4">日期</th>
                <th className="p-4">描述</th>
                <th className="p-4">分類</th>
                <th className="p-4">帳戶</th>
                <th className="p-4 text-right">金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-500">{t.date}</td>
                  <td className="p-4 font-medium text-gray-800">{t.description}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{t.category}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{getAccountName(t.accountId)}</td>
                  <td className={`p-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    沒有找到符合的交易紀錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-6">新增收支紀錄</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={TransactionType.EXPENSE}>支出</option>
                    <option value={TransactionType.INCOME}>收入</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述 (輸入後自動分類)</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  onBlur={handleDescriptionBlur}
                  placeholder="例如：午餐、搭捷運..."
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分類 {isAutoCategorizing && <span className="text-xs text-blue-500 animate-pulse">AI 判斷中...</span>}
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支付帳戶</label>
                <select
                  value={formData.accountId}
                  onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;