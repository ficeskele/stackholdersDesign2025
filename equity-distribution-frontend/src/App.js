import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import { SHA256 } from "crypto-js";

function App() {
  // Token state
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [tokenResult, setTokenResult] = useState(null);

  // Holder state (dynamic email fields)
  const [holderEmails, setHolderEmails] = useState([""]);
  const [holderEmailErrors, setHolderEmailErrors] = useState({});
  // holderResult will be an array of holder objects after successful creation
  const [holderResult, setHolderResult] = useState(null);

  // Distribution state
  const [distributionResults, setDistributionResults] = useState([]);

  // Calculator Questions state
  const [questionAnswers, setQuestionAnswers] = useState({
    ceo: "",
    dev: [],
    idea: [],
    rdmanager: "",
    parttime: [],
    leavefunding: [],
    leavedev: [],
    launch: [],
    revenue: [],
    blog: [],
    features: [],
    budget: [],
    expenses: [],
    vcpitch: "",
    connections: [],
  });
  // This will hold the result returned from the /calculate-equity endpoint.
  const [calculatedEquity, setCalculatedEquity] = useState(null);

  // Mapping for the 15 questions (labels and type)
  const questionMap = [
    { key: "ceo", label: "Who is the CEO?", type: "radio" },
    {
      key: "dev",
      label: "Which founders are coding most of the site/app?",
      type: "checkbox",
    },
    {
      key: "idea",
      label: "Who had the original idea and informed the others?",
      type: "checkbox",
    },
    {
      key: "rdmanager",
      label:
        "If you could magically hire a few developers, which founder should manage them?",
      type: "radio",
    },
    {
      key: "parttime",
      label:
        "Which founders are working part-time and will join full-time after funding?",
      type: "checkbox",
    },
    {
      key: "leavefunding",
      label:
        "If this founder leaves, it will severely impact your chances of raising funding",
      type: "checkbox",
    },
    {
      key: "leavedev",
      label:
        "If this founder leaves, your development schedule will be severely impacted",
      type: "checkbox",
    },
    {
      key: "launch",
      label:
        "If this founder leaves, it will compromise your launch or initial traction",
      type: "checkbox",
    },
    {
      key: "revenue",
      label:
        "If this founder leaves, it will likely prevent us from generating revenue quickly",
      type: "checkbox",
    },
    {
      key: "blog",
      label: "Who writes the blog and marketing copy on the site?",
      type: "checkbox",
    },
    {
      key: "features",
      label: "Who comes up with most of the features?",
      type: "checkbox",
    },
    {
      key: "budget",
      label: "Who has a spreadsheet with budget estimates or simulations?",
      type: "checkbox",
    },
    {
      key: "expenses",
      label:
        "Who currently pays for basic expenses like business cards and web hosting?",
      type: "checkbox",
    },
    { key: "vcpitch", label: "Who pitches to investors?", type: "radio" },
    {
      key: "connections",
      label:
        "Who is well-connected with your target industry and can make introductions?",
      type: "checkbox",
    },
  ];

  // Encrypt email using SHA-256 and convert to a numeric string
  const encryptEmail = (email) => {
    if (!email) return "";
    const hashedValue = SHA256(email).toString();
    let numericHash = "";
    for (let i = 0; i < hashedValue.length; i++) {
      const num = parseInt(hashedValue[i], 16);
      numericHash += num.toString().padStart(2, "0");
    }
    const maxLength = 64;
    return numericHash.slice(0, maxLength);
  };

  // Handle dynamic Holder email inputs
  const handleHolderEmailChange = (index, value) => {
    const newEmails = [...holderEmails];
    newEmails[index] = value;
    setHolderEmails(newEmails);

    // Validate email using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errors = { ...holderEmailErrors };
    if (value && !emailRegex.test(value)) {
      errors[index] = "Invalid format";
    } else {
      delete errors[index];
    }
    setHolderEmailErrors(errors);

    // If this field is valid and is the last one, add a new field (up to 4 fields)
    if (
      emailRegex.test(value) &&
      index === newEmails.length - 1 &&
      newEmails.length < 4
    ) {
      setHolderEmails([...newEmails, ""]);
    }
  };

  // Handle Holder creation submission (calls API for each valid email)
  const handleCreateHolder = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = holderEmails.filter(
      (email) => email && emailRegex.test(email)
    );
    if (validEmails.length === 0) {
      alert("Please enter at least one valid email");
      return;
    }
    const encryptedEmails = validEmails.map((email) => encryptEmail(email));
    try {
      const createHolderPromises = encryptedEmails.map((encryptedEmail) =>
        axios.post("http://localhost:3001/create-holder", {
          userId: encryptedEmail,
        })
      );
      const responses = await Promise.all(createHolderPromises);
      const holders = responses.map((response) => response.data);
      setHolderResult(holders);
    } catch (error) {
      console.error(error);
      setHolderResult([{ error: error.response?.data || error.message }]);
    }
  };

  // Handle Token creation
  const handleCreateToken = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/create-token", {
        name: tokenName,
        symbol: tokenSymbol,
        merchantAddress: merchantAddress,
      });
      setTokenResult(response.data);
      if (response.data.status === "creating" && response.data.token?.jobId) {
        const jobId = response.data.token.jobId;
        const checkStatus = async () => {
          try {
            const statusResponse = await axios.get(
              `http://localhost:3001/token-status/${jobId}`
            );
            setTokenResult(statusResponse.data);
            if (statusResponse.data.status === "pending") {
              setTimeout(checkStatus, 2000);
            }
          } catch (error) {
            console.error("Error checking status:", error);
          }
        };
        checkStatus();
      }
    } catch (error) {
      console.error(error);
      setTokenResult({ error: error.response?.data || error.message });
    }
  };

  // Convert questionAnswers into a payload for the backend.
  // For radio: convert the selected valid holder (email) to its 1-based index.
  // For checkbox: convert the array of selected emails to an array of 1-based indices.
  const prepareAnswersPayload = () => {
    return questionMap.map((q) => {
      const answer = questionAnswers[q.key];
      if (q.type === "radio") {
        const index = validHolders.indexOf(answer);
        return index >= 0 ? index + 1 : 1;
      } else if (q.type === "checkbox") {
        if (Array.isArray(answer)) {
          return answer
            .map((email) => {
              const index = validHolders.indexOf(email);
              return index >= 0 ? index + 1 : null;
            })
            .filter((x) => x !== null);
        } else {
          return [];
        }
      }
      return null;
    });
  };

  // Handle fetching the calculated equity from the backend when user clicks "Show Answers"
  const handleFetchEquity = async (e) => {
    e.preventDefault();
    // Check that all questions have an answer.
    const unanswered = questionMap.filter((q) => {
      if (q.type === "radio") {
        return !questionAnswers[q.key];
      } else if (q.type === "checkbox") {
        return !questionAnswers[q.key] || questionAnswers[q.key].length === 0;
      }
      return false;
    });
    if (unanswered.length > 0) {
      alert("Please answer all questions");
      return;
    }
    const answersPayload = prepareAnswersPayload();
    try {
      const response = await axios.post(
        "http://localhost:3001/calculate-equity",
        {
          founders: validHolders,
          answers: answersPayload,
        }
      );
      setCalculatedEquity(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to calculate equity");
    }
  };

  // Handle distribution using tokenResult and calculatedEquity
  const handleDistributeAll = async () => {
    if (
      !tokenResult ||
      tokenResult.status !== "success" ||
      !tokenResult.data ||
      !calculatedEquity ||
      !calculatedEquity.rows
    ) {
      alert("Please create a Token and calculate equity first");
      return;
    }
    if (!holderResult || !Array.isArray(holderResult)) {
      alert("Holder creation failed");
      return;
    }
    const totalSupply = tokenResult.data.totalSupply;
    const tokenAddressFromToken = tokenResult.data.address;
    try {
      // For each holder, compute the distribution amount.
      // If the amount is 0, skip calling the API for that holder.
      const distPromises = holderResult.map((holder, i) => {
        // Use only rows corresponding to actual holders
        const row = calculatedEquity.rows[i];
        if (!row)
          return Promise.resolve({ skipped: true, holder: holder.address });
        const pct = parseFloat(row.equity.replace("%", "").trim());
        const distributeAmount = Math.floor(totalSupply * (pct / 100));
        if (distributeAmount === 0) {
          return Promise.resolve({ skipped: true, holder: holder.address });
        }
        return axios.post("http://localhost:3001/distribute", {
          tokenAddress: tokenAddressFromToken,
          sendToAddress: holder.address,
          amount: distributeAmount,
        });
      });
      const distResponses = await Promise.all(distPromises);
      setDistributionResults(distResponses.map((r) => r.data || r));
    } catch (error) {
      console.error(error);
      setDistributionResults([
        { error: error.response?.data || error.message },
      ]);
    }
  };

  // Handle Calculator Questions input changes
  const handleRadioChange = (questionKey, value) => {
    setQuestionAnswers((prev) => ({ ...prev, [questionKey]: value }));
  };
  const handleCheckboxChange = (questionKey, value) => {
    setQuestionAnswers((prev) => {
      const prevArr = prev[questionKey] || [];
      if (prevArr.includes(value)) {
        return { ...prev, [questionKey]: prevArr.filter((v) => v !== value) };
      } else {
        return { ...prev, [questionKey]: [...prev[questionKey], value] };
      }
    });
  };

  // Derive valid holders from holderEmails (only valid, non-empty emails)
  const validHolders = holderEmails.filter(
    (email) => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

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
        Equity Distribution Frontend
      </h1>

      {/* Create Token Section */}
      <section
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
          Create Token
        </h2>
        <form onSubmit={handleCreateToken}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Token Name:
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
              placeholder="e.g., MyToken"
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Token Symbol:
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
              placeholder="e.g., MTK"
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Merchant Address:
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
              placeholder="e.g., 0x1234567890abcdef..."
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
          >
            Create Token
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

      {/* Create/Retrieve Holders Section */}
      <section
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
          Create/Retrieve Holders{" "}
          <span style={{ fontSize: "0.875rem", color: "#718096" }}>
            (Up to 4 members)
          </span>
        </h2>
        {!holderResult ? (
          <form onSubmit={handleCreateHolder}>
            {holderEmails.map((email, index) => (
              <div key={index} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem" }}>
                  Holder Email {index + 1}:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    handleHolderEmailChange(index, e.target.value)
                  }
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    padding: "0.5rem",
                  }}
                  placeholder="e.g., user@example.com"
                  required={index === 0}
                />
                {holderEmailErrors[index] && (
                  <div style={{ color: "red", fontSize: "0.875rem" }}>
                    {holderEmailErrors[index]}
                  </div>
                )}
                {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <div
                    style={{
                      marginTop: "0.25rem",
                      color: "#718096",
                      fontSize: "0.875rem",
                    }}
                  >
                    Encrypted Email: {encryptEmail(email)}
                  </div>
                )}
              </div>
            ))}
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#48bb78",
                color: "#fff",
              }}
            >
              Create Holders
            </button>
          </form>
        ) : (
          <div>
            <p>Holders created successfully!</p>
            <pre style={{ backgroundColor: "#edf2f7", padding: "0.5rem" }}>
              {JSON.stringify(holderResult, null, 2)}
            </pre>
          </div>
        )}
      </section>

      {/* Answer Questions Section (Shown after Holders are created) */}
      {holderResult && (
        <section
          style={{
            backgroundColor: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
            Answer Questions
          </h2>
          <form onSubmit={handleFetchEquity}>
            {questionMap.map((q) => (
              <div key={q.key} style={{ marginBottom: "1rem" }}>
                <p style={{ marginBottom: "0.25rem" }}>{q.label}</p>
                {validHolders.map((holder, index) => {
                  if (q.type === "radio") {
                    return (
                      <label key={index} style={{ marginRight: "1rem" }}>
                        <input
                          type="radio"
                          name={q.key}
                          value={holder}
                          checked={questionAnswers[q.key] === holder}
                          onChange={(e) =>
                            handleRadioChange(q.key, e.target.value)
                          }
                        />
                        {holder}
                      </label>
                    );
                  } else if (q.type === "checkbox") {
                    return (
                      <label key={index} style={{ marginRight: "1rem" }}>
                        <input
                          type="checkbox"
                          name={q.key}
                          value={holder}
                          checked={
                            questionAnswers[q.key] &&
                            questionAnswers[q.key].includes(holder)
                          }
                          onChange={() => handleCheckboxChange(q.key, holder)}
                        />
                        {holder}
                      </label>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            ))}
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#e53e3e",
                color: "#fff",
              }}
            >
              Show Answers
            </button>
          </form>
          {calculatedEquity && (
            <pre
              style={{
                marginTop: "1rem",
                backgroundColor: "#edf2f7",
                padding: "0.5rem",
              }}
            >
              {JSON.stringify(calculatedEquity, null, 2)}
            </pre>
          )}
        </section>
      )}

      {/* Warning Box for Equity Error Message */}
      {calculatedEquity && calculatedEquity.errorMessage && (
        <div
          style={{
            backgroundColor: "#FEE2E2",
            border: "1px solid #e53e3e",
            padding: "0.75rem",
            marginBottom: "1.5rem",
            borderRadius: "0.375rem",
            color: "#9B2C2C",
          }}
        >
          {calculatedEquity.errorMessage.split("\n").map((line, idx) => (
            <p key={idx} style={{ margin: "0.25rem 0" }}>
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Distribute Tokens Section */}
      {tokenResult &&
        tokenResult.status === "success" &&
        tokenResult.data &&
        holderResult &&
        calculatedEquity &&
        calculatedEquity.rows && (
          <section
            style={{
              backgroundColor: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
              Distribute Tokens
            </h2>
            <div>
              <p>
                Token Address: <strong>{tokenResult.data.address}</strong>
              </p>
              <p>
                Token Total Supply:{" "}
                <strong>
                  {tokenResult.data.totalSupply -
                    tokenResult.data.merchantSupply}
                </strong>
              </p>
            </div>
            <div>
              <h3>Distribution Information for Each Holder</h3>
              {calculatedEquity.rows
                .slice(0, holderResult.length)
                .map((row, i) => {
                  const pct = parseFloat(row.equity.replace("%", "").trim());
                  const distributeAmount = Math.floor(
                    tokenResult.data.totalSupply * (pct / 100)
                  );
                  return (
                    <div
                      key={i}
                      style={{
                        marginBottom: "1rem",
                        padding: "0.5rem",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <p>
                        <strong>Holder {i + 1}:</strong>{" "}
                        {holderResult[i]?.address}
                      </p>
                      <p>
                        Equity Percentage: <strong>{row.equity}</strong>
                      </p>
                      <p>
                        Distribution Amount: <strong>{distributeAmount}</strong>
                      </p>
                    </div>
                  );
                })}
            </div>
            <button
              onClick={handleDistributeAll}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#9f7aea",
                color: "#fff",
              }}
            >
              Distribute All Tokens
            </button>
            {distributionResults.length > 0 && (
              <div
                style={{
                  marginTop: "1rem",
                  backgroundColor: "#edf2f7",
                  padding: "0.5rem",
                }}
              >
                <h3>Distribution Results</h3>
                <pre>{JSON.stringify(distributionResults, null, 2)}</pre>
              </div>
            )}
          </section>
        )}
    </div>
  );
}

export default App;
