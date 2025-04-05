const express = require("express");
const axios = require("axios");
const cors = require("cors");
const puppeteer = require("puppeteer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const METAL_BASE_URL = "https://api.metal.build";
const METAL_API_KEY = process.env.METAL_API_KEY;

// Metal API client
const metal = axios.create({
  baseURL: METAL_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": METAL_API_KEY,
  },
});

app.get("/", (req, res) => {
  res.send("Hello from TaskBoard Equity API");
});

// Route: Create Token using Merchant endpoint
app.post("/create-token", async (req, res) => {
  try {
    const { name, symbol, merchantAddress } = req.body;

    const response = await metal.post("/merchant/create-token", {
      name,
      symbol,
      merchantAddress,
      canDistribute: true,
      canLP: true,
    });

    // Return the created token object
    res.json({ status: "creating", token: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Token creation failed" });
  }
});

// Route: Create or Retrieve Holder
app.post("/create-holder", async (req, res) => {
  const { userId } = req.body;

  try {
    const response = await metal.put(`/holder/${userId}`);
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Holder creation failed" });
  }
});

// Route: Distribute Tokens
app.post("/distribute", async (req, res) => {
  const { tokenAddress, recipientAddress, amount } = req.body;

  try {
    const response = await metal.post(`/token/${tokenAddress}/distribute`, {
      sendToAddress: recipientAddress,
      amount,
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Distribution failed" });
  }
});

// Route: Get Token Creation Status
app.get("/token-status/:jobId", async (req, res) => {
  const { jobId } = req.params;

  try {
    const response = await metal.get(`/merchant/create-token/status/${jobId}`);
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch token status" });
  }
});

/**
 * New Endpoint: Calculate Equity
 *
 * Expects a JSON body containing:
 *   - founders: an array of founder names (e.g. ["Founder A", "Founder B", ...])
 *   - answers: an array of 15 numbers (each 1 to 4) representing the answer for each question.
 *
 * The endpoint will launch Puppeteer (headless) to load the Foundrs website,
 * fill in the form with the provided data (without randomization),
 * wait for the page to compute the equity table, and then extract and return the results.
 */
app.post("/calculate-equity", async (req, res) => {
  try {
    const { founders, answers } = req.body;
    const finalFounders =
      Array.isArray(founders) && founders.length > 0
        ? founders
        : ["Founder A", "Founder B", "Founder C", "Founder D"];
    const finalAnswers =
      Array.isArray(answers) && answers.length === 15
        ? answers
        : [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];

    const browser = await puppeteer.launch({
      headless: true,
      product: "chrome",
    });
    const page = await browser.newPage();

    await page.goto("https://foundrs.com/", { waitUntil: "networkidle0" });

    // Fill in founder names and update labels
    await page.evaluate((founders) => {
      founders.forEach((name, index) => {
        const input = document.getElementById(`name${index + 1}`);
        if (input) {
          input.value = name;
        }
      });
      if (typeof updateFounders === "function") {
        updateFounders();
      }
    }, finalFounders);

    // Fixed question mapping (using the same prefixes as Foundrs)
    const questionMap = [
      { prefix: "ceo", type: "radio" },
      { prefix: "dev", type: "checkbox" },
      { prefix: "idea", type: "checkbox" },
      { prefix: "rdmanager", type: "radio" },
      { prefix: "parttime", type: "checkbox" },
      { prefix: "leavefunding", type: "checkbox" },
      { prefix: "leavedev", type: "checkbox" },
      { prefix: "launch", type: "checkbox" },
      { prefix: "revenue", type: "checkbox" },
      { prefix: "blog", type: "checkbox" },
      { prefix: "features", type: "checkbox" },
      { prefix: "budget", type: "checkbox" },
      { prefix: "expenses", type: "checkbox" },
      { prefix: "vcpitch", type: "radio" },
      { prefix: "connections", type: "checkbox" },
    ];

    await page.evaluate(
      (questionMap, answers) => {
        questionMap.forEach((q, idx) => {
          const answer = answers[idx];
          const elementId = `${q.prefix}-${answer}`;
          const el = document.getElementById(elementId);
          if (el) {
            el.checked = true;
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      },
      questionMap,
      finalAnswers
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = await page.evaluate(() => {
      const rows = [];
      document.querySelectorAll("#equity tbody tr").forEach((row) => {
        const founder = row.querySelector("td:first-child")?.innerText.trim();
        const equity = row.querySelector("td:last-child")?.innerText.trim();
        rows.push({ founder, equity });
      });
      const errorMessage = document.getElementById("errors")?.innerText.trim();
      return { rows, errorMessage };
    });

    await browser.close();
    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Equity calculation failed", details: error.toString() });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
