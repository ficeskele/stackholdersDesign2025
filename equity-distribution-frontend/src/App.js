import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // 你可以在這裡加入自訂 CSS 或 Tailwind classes

function App() {
  // 建立 Token 狀態
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [merchantAddress, setMerchantAddress] = useState('');
  const [tokenResult, setTokenResult] = useState(null);

  // 建立 Holder 狀態
  const [userId, setUserId] = useState('');
  const [holderResult, setHolderResult] = useState(null);

  // 分發股份狀態
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [distributeResult, setDistributeResult] = useState(null);

  // 呼叫後端 API 建立 Token
  const handleCreateToken = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/create-token', {
        name: tokenName,
        symbol: tokenSymbol,
        merchantAddress: merchantAddress,
      });
      setTokenResult(response.data);
    } catch (error) {
      console.error(error);
      setTokenResult({ error: error.response?.data || error.message });
    }
  };

  // 呼叫後端 API 建立/取得 Holder
  const handleCreateHolder = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/create-holder', {
        userId: userId,
      });
      setHolderResult(response.data);
    } catch (error) {
      console.error(error);
      setHolderResult({ error: error.response?.data || error.message });
    }
  };

  // 呼叫後端 API 分發股份
  const handleDistribute = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/distribute', {
        tokenAddress: tokenAddress,
        recipientAddress: recipientAddress,
        amount: amount,
      });
      setDistributeResult(response.data);
    } catch (error) {
      console.error(error);
      setDistributeResult({ error: error.response?.data || error.message });
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6">股權分配機器前端</h1>
      
      {/* 建立 Token 區塊 */}
      <section className="bg-white shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">建立 Token</h2>
        <form onSubmit={handleCreateToken}>
          <div className="mb-4">
            <label className="block mb-1">Token 名稱:</label>
            <input 
              type="text" 
              value={tokenName} 
              onChange={(e) => setTokenName(e.target.value)}
              className="w-full border p-2" 
              placeholder="例如：MyToken"
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Token 符號:</label>
            <input 
              type="text" 
              value={tokenSymbol} 
              onChange={(e) => setTokenSymbol(e.target.value)}
              className="w-full border p-2" 
              placeholder="例如：MTK"
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">商家地址:</label>
            <input 
              type="text" 
              value={merchantAddress} 
              onChange={(e) => setMerchantAddress(e.target.value)}
              className="w-full border p-2" 
              placeholder="例如：0x1234567890abcdef..."
              required 
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white">建立 Token</button>
        </form>
        {tokenResult && (
          <pre className="mt-4 bg-gray-200 p-2">{JSON.stringify(tokenResult, null, 2)}</pre>
        )}
      </section>

      {/* 建立 Holder 區塊 */}
      <section className="bg-white shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">建立/取得 Holder</h2>
        <form onSubmit={handleCreateHolder}>
          <div className="mb-4">
            <label className="block mb-1">使用者 ID (例如 Email):</label>
            <input 
              type="text" 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border p-2" 
              placeholder="例如：user@example.com"
              required 
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-green-500 text-white">建立 Holder</button>
        </form>
        {holderResult && (
          <pre className="mt-4 bg-gray-200 p-2">{JSON.stringify(holderResult, null, 2)}</pre>
        )}
      </section>

      {/* 發放股份 區塊 */}
      <section className="bg-white shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">發放股份</h2>
        <form onSubmit={handleDistribute}>
          <div className="mb-4">
            <label className="block mb-1">Token 地址:</label>
            <input 
              type="text" 
              value={tokenAddress} 
              onChange={(e) => setTokenAddress(e.target.value)}
              className="w-full border p-2" 
              placeholder="例如：0xTokenAddress..."
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">接收者地址:</label>
            <input 
              type="text" 
              value={recipientAddress} 
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full border p-2" 
              placeholder="例如：0xRecipientAddress..."
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">發放數量:</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border p-2" 
              placeholder="例如：100"
              required 
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-purple-500 text-white">發放股份</button>
        </form>
        {distributeResult && (
          <pre className="mt-4 bg-gray-200 p-2">{JSON.stringify(distributeResult, null, 2)}</pre>
        )}
      </section>
    </div>
  );
}

export default App;
