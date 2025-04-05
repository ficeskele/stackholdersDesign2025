const puppeteer = require("puppeteer");

(async () => {
  // Launch Puppeteer with Firefox (visible window)
  const browser = await puppeteer.launch({
    headless: false,
    product: "chrome",
  });

  const page = await browser.newPage();

  // Navigate to the Foundrs website
  await page.goto("https://foundrs.com/", { waitUntil: "networkidle0" });

  // Define your form data (founders names)
  const founders = ["A", "B", "C", "D"];

  // Map question indexes to input prefix and type
  // The types here are just informational (radio or checkbox)
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
  }, founders);

  // Randomize answers for the 15 questions:
  // For each question, randomly choose one option from 0 to 3 (0 corresponds to option 1)
  await page.evaluate((questionMap) => {
    questionMap.forEach((q) => {
      const randomIndex = Math.floor(Math.random() * 4); // 0 to 3
      const optionIndex = randomIndex + 1; // form element IDs are 1-indexed
      const elementId = `${q.prefix}-${optionIndex}`;
      const el = document.getElementById(elementId);
      if (el) {
        el.checked = true;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }, questionMap);

  // Wait for the page to update (allow compute() to run)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Extract and log the equity table and any error/message text
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

  console.log("Equity Table:", result.rows);
  console.log("Message:", result.errorMessage);

  await browser.close();
})();
