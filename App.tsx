import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, CreditCard, PieChart, UserCircle, LogOut, Bot, LogIn } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AccountManager from './components/AccountManager';
import TransactionManager from './components/TransactionManager';
import StockMarket from './components/StockMarket';
import AIAdvisor from './components/AIAdvisor';
import { AppData, BankAccount, Transaction, StockHolding, User, TransactionType } from './types';
import { auth, db, googleProvider } from './services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// 預設示範資料
const SAMPLE_DATA: AppData = {
  accounts: [
    { id: 'acc_demo_1', name: '薪轉帳戶', type: 'Savings', balance: 52000, currency: 'TWD' },
    { id: 'acc_demo_2', name: '主要信用卡', type: 'Credit', balance: -8500, currency: 'TWD' }
  ],
  transactions: [
    { id: 'tx_demo_1', accountId: 'acc_demo_1', date: new Date().toISOString().split('T')[0], amount: 65000, type: TransactionType.INCOME, category: '薪資', description: '本月薪資收入' },
    { id: 'tx_demo_2', accountId: 'acc_demo_2', date: new Date().toISOString().split('T')[0], amount: 250, type: TransactionType.EXPENSE, category: '飲食', description: '商業午餐' },
    { id: 'tx_demo_3', accountId: 'acc_demo_2', date: new Date().toISOString().split('T')[0], amount: 1200, type: TransactionType.EXPENSE, category: '交通', description: '高鐵票' }
  ],
  stocks: [
    { id: 'st_demo_1', symbol: '2330', name: '台積電', shares: 1000, avgCost: 550, currentPrice: 780, market: 'TWSE' },
    { id: 'st_demo_2', symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgCost: 150, currentPrice: 185, market: 'NASDAQ' }
  ]
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'transactions' | 'stocks'>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  
  // App Data State
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stocks, setStocks] = useState<StockHolding[]>([]);

  // 監聽 Firebase 登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: FirebaseUser | null) => {
      if (currentUser) {
        setUser({
          id: currentUser.uid,
          username: currentUser.displayName || '使用者',
          email: currentUser.email || ''
        });
        await loadUserData(currentUser.uid);
      } else {
        setUser(null);
        setAccounts([]);
        setTransactions([]);
        setStocks([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 從 Firestore 讀取資料
  const loadUserData = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as AppData;
        setAccounts(data.accounts || []);
        setTransactions(data.transactions || []);
        setStocks(data.stocks || []);
      } else {
        // 如果是新用戶，初始化示範資料
        await setDoc(docRef, SAMPLE_DATA);
        setAccounts(SAMPLE_DATA.accounts);
        setTransactions(SAMPLE_DATA.transactions);
        setStocks(SAMPLE_DATA.stocks);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // 當資料變更時，同步回 Firestore (Debounced)
  useEffect(() => {
    if (!user) return;

    const saveData = async () => {
      try {
        await setDoc(doc(db, 'users', user.id), {
          accounts,
          transactions,
          stocks
        }, { merge: true });
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };

    const timeoutId = setTimeout(saveData, 1000); // 延遲 1 秒儲存，避免頻繁寫入
    return () => clearTimeout(timeoutId);
  }, [accounts, transactions, stocks, user]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("登入失敗，請稍後再試");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const fullData: AppData = { accounts, transactions, stocks };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">載入中...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">WealthFlow AI</h1>
            <p className="text-gray-500">個人化智慧財務管理系統</p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-6">
              請登入以存取您的雲端財務資料
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-3"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              使用 Google 帳號登入
            </button>
            
            <div className="text-center text-xs text-gray-400 mt-4">
              資料將安全儲存於 Firebase 雲端資料庫
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 z-10">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
          <span className="font-bold text-xl text-gray-800">WealthFlow</span>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
            總覽儀表板
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'accounts' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Wallet size={20} />
            帳戶管理
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'transactions' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <CreditCard size={20} />
            收支紀錄
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'stocks' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <PieChart size={20} />
            股市投資
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
           <div className="flex items-center gap-3 px-4 py-3 mb-2">
             {user.username ? (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {user.username[0]}
                </div>
             ) : (
                <UserCircle size={20} className="text-gray-400" />
             )}
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
               <p className="text-xs text-gray-500 truncate">{user.email}</p>
             </div>
           </div>
           <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
           >
             <LogOut size={16} />
             登出
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen relative">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard data={fullData} />}
          {activeTab === 'accounts' && <AccountManager accounts={accounts} setAccounts={setAccounts} />}
          {activeTab === 'transactions' && (
            <TransactionManager 
              transactions={transactions} 
              setTransactions={setTransactions} 
              accounts={accounts}
              setAccounts={setAccounts}
            />
          )}
          {activeTab === 'stocks' && <StockMarket stocks={stocks} setStocks={setStocks} />}
        </div>
      </main>

      {/* Floating AI Button */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition transform z-40 group"
      >
        <Bot size={28} />
        <span className="absolute right-full mr-3 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          AI 財務顧問
        </span>
      </button>

      {/* AI Advisor Panel */}
      <AIAdvisor data={fullData} isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
};

export default App;