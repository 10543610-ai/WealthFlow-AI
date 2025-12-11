import React, { useState } from 'react';
import { BankAccount } from '../types';
import { Plus, Trash2, Edit2, CreditCard } from 'lucide-react';

interface AccountManagerProps {
  accounts: BankAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
}

const AccountManager: React.FC<AccountManagerProps> = ({ accounts, setAccounts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<BankAccount, 'id'>>({
    name: '',
    type: 'Savings',
    balance: 0,
    currency: 'TWD'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setAccounts(prev => prev.map(acc => acc.id === editingId ? { ...formData, id: editingId } : acc));
    } else {
      const newAccount: BankAccount = {
        ...formData,
        id: Date.now().toString(),
      };
      setAccounts(prev => [...prev, newAccount]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此帳戶嗎？所有相關交易紀錄可能需要手動修正。')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const openEdit = (account: BankAccount) => {
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency
    });
    setEditingId(account.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', type: 'Savings', balance: 0, currency: 'TWD' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">銀行與現金帳戶</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} /> 新增帳戶
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => (
          <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => openEdit(account)} className="p-1 text-gray-500 hover:text-blue-600">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(account.id)} className="p-1 text-gray-500 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{account.name}</h3>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{account.type}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">目前餘額</p>
              <p className="text-2xl font-bold text-gray-900">
                {account.currency} {account.balance.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">{editingId ? '編輯帳戶' : '新增帳戶'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">帳戶名稱</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="例如：玉山薪轉戶"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">帳戶類型</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Checking">支票存款 (Checking)</option>
                  <option value="Savings">活期儲蓄 (Savings)</option>
                  <option value="Credit">信用卡 (Credit)</option>
                  <option value="Investment">證券戶 (Investment)</option>
                  <option value="Cash">現金 (Cash)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">初始餘額</label>
                <input
                  type="number"
                  required
                  value={formData.balance}
                  onChange={e => setFormData({ ...formData, balance: Number(e.target.value) })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">幣別</label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="TWD">新台幣 (TWD)</option>
                  <option value="USD">美元 (USD)</option>
                  <option value="JPY">日幣 (JPY)</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
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

export default AccountManager;