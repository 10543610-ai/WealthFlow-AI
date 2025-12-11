import React, { useState } from 'react';
import { StockHolding } from '../types';
import { RefreshCw, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';

interface StockMarketProps {
  stocks: StockHolding[];
  setStocks: React.Dispatch<React.SetStateAction<StockHolding[]>>;
}

const StockMarket: React.FC<StockMarketProps> = ({ stocks, setStocks }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Mock adding a stock
  const [newStock, setNewStock] = useState<Partial<StockHolding>>({
    symbol: '',
    name: '',
    shares: 0,
    avgCost: 0,
    currentPrice: 0,
    market: 'TWSE'
  });

  const simulateMarketUpdate = () => {
    setIsUpdating(true);
    // Simulate API call delay
    setTimeout(() => {
      setStocks(prev => prev.map(stock => {
        // Random fluctuation between -5% and +5%
        const changePercent = (Math.random() * 0.10) - 0.05;
        const newPrice = stock.currentPrice * (1 + changePercent);
        return {
          ...stock,
          currentPrice: parseFloat(newPrice.toFixed(2))
        };
      }));
      setIsUpdating(false);
    }, 1500);
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStock.symbol || !newStock.shares || !newStock.avgCost) return;

    const stock: StockHolding = {
      id: Date.now().toString(),
      symbol: newStock.symbol.toUpperCase(),
      name: newStock.name || newStock.symbol?.toUpperCase() || 'Unknown',
      shares: Number(newStock.shares),
      avgCost: Number(newStock.avgCost),
      currentPrice: Number(newStock.avgCost), // Initialize with cost
      market: newStock.market as 'TWSE' | 'NASDAQ' | 'NYSE' || 'TWSE'
    };

    setStocks(prev => [...prev, stock]);
    setIsModalOpen(false);
    setNewStock({ symbol: '', name: '', shares: 0, avgCost: 0, currentPrice: 0, market: 'TWSE' });
  };

  const removeStock = (id: string) => {
    setStocks(prev => prev.filter(s => s.id !== id));
  };

  const totalCost = stocks.reduce((acc, s) => acc + (s.shares * s.avgCost), 0);
  const totalValue = stocks.reduce((acc, s) => acc + (s.shares * s.currentPrice), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost === 0 ? 0 : (totalGainLoss / totalCost) * 100;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">股市資產管理</h2>
           <p className="text-sm text-gray-500">即時追蹤台股與美股持倉部位</p>
        </div>
       
        <div className="flex gap-3">
          <button
            onClick={simulateMarketUpdate}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition ${isUpdating ? 'opacity-75' : ''}`}
          >
            <RefreshCw size={18} className={isUpdating ? 'animate-spin' : ''} />
            {isUpdating ? '更新中...' : '更新報價'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} /> 新增持股
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">總投入成本</p>
          <p className="text-xl font-bold text-gray-800">NT$ {totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">目前市值</p>
          <p className="text-xl font-bold text-blue-600">NT$ {Math.round(totalValue).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">未實現損益</p>
          <div className={`text-xl font-bold flex items-center gap-2 ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalGainLoss >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            NT$ {Math.round(totalGainLoss).toLocaleString()} ({totalGainLossPercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">代號 / 名稱</th>
              <th className="p-4">市場</th>
              <th className="p-4 text-right">持有股數</th>
              <th className="p-4 text-right">平均成本</th>
              <th className="p-4 text-right">現價</th>
              <th className="p-4 text-right">市值</th>
              <th className="p-4 text-right">損益</th>
              <th className="p-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stocks.map(stock => {
              const marketValue = stock.shares * stock.currentPrice;
              const gainLoss = marketValue - (stock.shares * stock.avgCost);
              const gainPercent = ((stock.currentPrice - stock.avgCost) / stock.avgCost) * 100;
              
              return (
                <tr key={stock.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{stock.symbol}</div>
                    <div className="text-xs text-gray-500">{stock.name}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${stock.market === 'TWSE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {stock.market}
                    </span>
                  </td>
                  <td className="p-4 text-right">{stock.shares.toLocaleString()}</td>
                  <td className="p-4 text-right text-gray-600">{stock.avgCost.toLocaleString()}</td>
                  <td className="p-4 text-right font-medium">{stock.currentPrice.toLocaleString()}</td>
                  <td className="p-4 text-right font-bold text-gray-800">{Math.round(marketValue).toLocaleString()}</td>
                  <td className={`p-4 text-right font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                     {gainLoss > 0 ? '+' : ''}{Math.round(gainLoss).toLocaleString()}
                     <br/>
                     <span className="text-xs">({gainPercent.toFixed(2)}%)</span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => removeStock(stock.id)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">新增持股</h3>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">股票代號</label>
                <input
                  type="text"
                  required
                  placeholder="如: 2330, AAPL"
                  value={newStock.symbol}
                  onChange={e => setNewStock({ ...newStock, symbol: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">股票名稱</label>
                <input
                  type="text"
                  placeholder="如: 台積電"
                  value={newStock.name}
                  onChange={e => setNewStock({ ...newStock, name: e.target.value })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">市場</label>
                   <select
                      value={newStock.market}
                      onChange={e => setNewStock({ ...newStock, market: e.target.value as any })}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                   >
                     <option value="TWSE">台股 (TWSE)</option>
                     <option value="NASDAQ">美股 (NASDAQ)</option>
                     <option value="NYSE">美股 (NYSE)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">持有股數</label>
                   <input
                    type="number"
                    required
                    value={newStock.shares}
                    onChange={e => setNewStock({ ...newStock, shares: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">平均成本 (單股)</label>
                 <input
                  type="number"
                  required
                  value={newStock.avgCost}
                  onChange={e => setNewStock({ ...newStock, avgCost: Number(e.target.value) })}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                 />
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
                  確認新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMarket;