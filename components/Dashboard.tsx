import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AppData, TransactionType } from '../types';
import { Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface DashboardProps {
  data: AppData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const totalBalance = data.accounts.reduce((acc, curr) => acc + curr.balance, 0);
  
  const totalInvestments = data.stocks.reduce((acc, curr) => acc + (curr.shares * curr.currentPrice), 0);
  const totalAssets = totalBalance + totalInvestments;

  // Calculate Income vs Expense
  const income = data.transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);
  
  const expense = data.transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  // Category Breakdown for Pie Chart
  const categoryDataMap = data.transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    value: categoryDataMap[key]
  }));

  const barData = [
    { name: '總收入', amount: income },
    { name: '總支出', amount: expense },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 text-gray-500 mb-2">
            <Wallet size={20} />
            <span className="text-sm font-medium">總資產 (現金+股票)</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">NT$ {totalAssets.toLocaleString()}</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 text-gray-500 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm font-medium">股票市值</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">NT$ {totalInvestments.toLocaleString()}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 text-green-500 mb-2">
            <ArrowUpCircle size={20} />
            <span className="text-sm font-medium text-gray-500">本月收入</span>
          </div>
          <div className="text-2xl font-bold text-green-600">NT$ {income.toLocaleString()}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 text-red-500 mb-2">
            <ArrowDownCircle size={20} />
            <span className="text-sm font-medium text-gray-500">本月支出</span>
          </div>
          <div className="text-2xl font-bold text-red-600">NT$ {expense.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">支出分類</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `NT$ ${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">暫無支出資料</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">收支概況</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `NT$ ${value.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;