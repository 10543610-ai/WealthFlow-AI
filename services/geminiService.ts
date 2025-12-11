import { GoogleGenAI } from "@google/genai";
import { AppData } from '../types';

const getAiClient = () => {
  // Use process.env.API_KEY exclusively as per guidelines
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeFinances = async (data: AppData): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "請先設定 API Key 以使用 AI 顧問功能。";

  try {
    // Summarize data to avoid token limits
    const summary = {
      totalCash: data.accounts.reduce((sum, acc) => sum + acc.balance, 0),
      accounts: data.accounts.map(a => ({ name: a.name, balance: a.balance })),
      portfolioValue: data.stocks.reduce((sum, s) => sum + (s.shares * s.currentPrice), 0),
      topHoldings: data.stocks.slice(0, 5).map(s => s.symbol),
      recentTransactions: data.transactions.slice(0, 10)
    };

    const prompt = `
      請擔任我的私人財務顧問。根據以下我的財務摘要資料，請提供簡短的財務健康檢查與建議。
      
      資料摘要:
      ${JSON.stringify(summary, null, 2)}
      
      請包含：
      1. 資產配置分析 (現金 vs 投資)。
      2. 近期消費模式提醒 (如果有的話)。
      3. 針對目前持股的簡單建議 (基於通用投資原則)。
      
      請使用繁體中文回答，語氣專業但親切。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response preferred
      }
    });

    return response.text || "無法生成建議，請稍後再試。";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI 服務暫時無法使用，請檢查連線或 API Key。";
  }
};

export const suggestCategory = async (description: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "其他";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `基於描述 "${description}"，請從以下清單選出最適合的分類：[飲食, 交通, 薪資, 居住, 娛樂, 醫療, 投資, 購物, 其他]。只回傳分類名稱，不要有其他文字。`,
    });
    return response.text?.trim() || "其他";
  } catch (e) {
    return "其他";
  }
};