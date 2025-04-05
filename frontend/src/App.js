// 

import React, { useState } from 'react';

function App() {
  const [tokenResult, setTokenResult] = useState(null);
  const [holderResult, setHolderResult] = useState(null);
  const [distributeResult, setDistributeResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCreateToken = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/create-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: e.target.tokenName.value,
          symbol: e.target.tokenSymbol.value,
          merchantAddress: e.target.merchantAddress.value,
        }),
      });
      const data = await response.json();
      setTokenResult(data);
      setError(null);
    } catch (err) {
      setError('建立 Token 時發生錯誤');
      console.error(err);
    }
  };

  const handleCreateHolder = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/create-holder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: e.target.userId.value,
        }),
      });
      const data = await response.json();
      setHolderResult(data);
      setError(null);
    } catch (err) {
      setError('建立/取得 Holder 時發生錯誤');
      console.error(err);
    }
  };

  const handleDistribute = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/distribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenAddress: e.target.tokenAddress.value,
          recipientAddress: e.target.recipientAddress.value,
          amount: e.target.amount.value,
        }),
      });
      const data = await response.json();
      setDistributeResult(data);
      setError(null);
    } catch (err) {
      setError('分發股份時發生錯誤');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="divide-y divide-gray-200">
              {/* 建立 Token 表單 */}
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-4">建立 Token</h2>
                <form onSubmit={handleCreateToken} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Token Name</label>
                    <input type="text" name="tokenName" required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Token Symbol</label>
                    <input type="text" name="tokenSymbol" required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Merchant Address</label>
                    <input type="text" name="merchantAddress" required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  </div>
                  <button type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    建立 Token
                  </button>
                </form>
                {tokenResult && (
                  <div className="mt-4">
                    <h3 className="font-bold">結果：</h3>
                    <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(tokenResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* 建立/取得 Holder 表單 */}
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-4">建立/取得 Holder</h2>
                <form onSubmit={handleCreateHolder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <input type="text" name="userId" required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  </div>
                  <button type="submit"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    建立/取得 Holder
                  </button>
                </form>
                {holderResult && (
                  <div className="mt-4">
                    <h3 className="font-bold">結果：</h3>
                    <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(holderResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* 分發股份表單 */}
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-4">分發股份</h2>
                <form onSubmit={handleDistribute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Token Address</label>
                    <input type="text" name="tokenAddress" required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recipient Address</label>
                    <input type="text" name="recipientAddress" required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input type="number" name="amount" required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                  </div>
                  <button type="submit"
                    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    分發股份
                  </button>
                </form>
                {distributeResult && (
                  <div className="mt-4">
                    <h3 className="font-bold">結果：</h3>
                    <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(distributeResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 