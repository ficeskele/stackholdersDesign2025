const express = require('express');
const axios = require('./node_modules/axios/index.d.cts');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const METAL_BASE_URL = 'https://api.metal.build';
const METAL_API_KEY = process.env.METAL_API_KEY;

// Metal API client - 更新 header 使用 x-api-key
const metal = axios.create({
  baseURL: METAL_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': METAL_API_KEY,
  },
});

app.get('/', (req, res) => {
  res.send('Hello from TaskBoard Equity API');
});

// Route: 建立 Token 使用 Merchant 端點
app.post('/create-token', async (req, res) => {
  try {
    const { name, symbol, merchantAddress } = req.body;

    const response = await metal.post('/merchant/create-token', {
      name,
      symbol,
      merchantAddress,
      canDistribute: true,
      canLP: true,
    });

    // 根據文件，回傳的內容為建立的 token 物件
    res.json({ status: 'creating', token: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Token creation failed' });
  }
});

// Route: 創建或取得 Holder
app.post('/create-holder', async (req, res) => {
  const { userId } = req.body;

  try {
    const response = await metal.put(`/holder/${userId}`);
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Holder creation failed' });
  }
});

// Route: 分發股份
app.post('/distribute', async (req, res) => {
  const { tokenAddress, recipientAddress, amount } = req.body;

  try {
    const response = await metal.post(`/token/${tokenAddress}/distribute`, {
      address: recipientAddress,
      amount,
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Distribution failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
