import React, { useState } from "react";
import axios from "axios";
import "./App.css"; // 你可以在這裡加入自訂 CSS 或 Tailwind classes

function App() {
  // 建立 Token 狀態
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [tokenResult, setTokenResult] = useState(null);

  // 建立 Holder 狀態
  const [userId, setUserId] = useState("");
  const [holderResult, setHolderResult] = useState(null);

  // 分發股份狀態
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [distributeResult, setDistributeResult] = useState(null);

  // 呼叫後端 API 建立 Token
  const handleCreateToken = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/create-token", {
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
      const response = await axios.post("http://localhost:3001/create-holder", {
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
      const response = await axios.post("http://localhost:3001/distribute", {
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
    <div
      style={{
        minHeight: "100vh",
        padding: "1rem",
        backgroundColor: "#f7fafc",
      }}
    >
      <h1
        style={{
          fontSize: "1.875rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        股權分配機器前端
      </h1>

      {/* 建立 Token 區塊 */}
      <section
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "1rem",
          }}
        >
          建立 Token
        </h2>
        <form onSubmit={handleCreateToken}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Token 名稱:
            </label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                padding: "0.5rem",
              }}
              placeholder="例如：MyToken"
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Token 符號:
            </label>
            <input
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                padding: "0.5rem",
              }}
              placeholder="MTK"
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              商家地址:
            </label>
            <input
              type="text"
              value={merchantAddress}
              onChange={(e) => setMerchantAddress(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                padding: "0.5rem",
              }}
              placeholder="0x1234567890abcdef..."
              required
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#4299e1",
              color: "#fff",
            }}
            onClick={async (e) => {
              e.preventDefault();
              try {
                const response = await axios.post(
                  "http://localhost:3001/create-token",
                  {
                    name: tokenName,
                    symbol: tokenSymbol,
                    merchantAddress: merchantAddress,
                  },
                );
                setTokenResult(response.data);
              } catch (error) {
                console.error(error);
                setTokenResult({
                  error: error.response?.data || error.message,
                });
              }
            }}
          >
            建立 Token
          </button>
        </form>
        {tokenResult && (
          <pre
            style={{
              marginTop: "1rem",
              backgroundColor: "#edf2f7",
              padding: "0.5rem",
            }}
          >
            {JSON.stringify(tokenResult, null, 2)}
          </pre>
        )}
      </section>

      {/* 建立 Holder 區塊 */}
      <section
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "1rem",
          }}
        >
          建立/取得 Holder
        </h2>
        <form onSubmit={handleCreateHolder}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              使用者 ID (例如 Email):
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                padding: "0.5rem",
              }}
              placeholder="例如：user@example.com"
              required
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#48bb78",
              color: "#fff",
            }}
          >
            建立 Holder
          </button>
        </form>
        {holderResult && (
          <pre
            style={{
              marginTop: "1rem",
              backgroundColor: "#edf2f7",
              padding: "0.5rem",
            }}
          >
            {JSON.stringify(holderResult, null, 2)}
          </pre>
        )}
      </section>

      {/* 發放股份 區塊 */}
      <section
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "1rem",
          }}
        >
          發放股份
        </h2>
        <form onSubmit={handleDistribute}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Token 地址:
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                padding: "0.5rem",
              }}
              placeholder="例如：0xTokenAddress..."
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              接收者地址:
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                padding: "0.5rem",
              }}
              placeholder="例如：0xRecipientAddress..."
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              發放數量:
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e2e8f0",
                padding: "0.5rem",
              }}
              placeholder="例如：100"
              required
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#9f7aea",
              color: "#fff",
            }}
          >
            發放股份
          </button>
        </form>
        {distributeResult && (
          <pre
            style={{
              marginTop: "1rem",
              backgroundColor: "#edf2f7",
              padding: "0.5rem",
            }}
          >
            {JSON.stringify(distributeResult, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}

export default App;
