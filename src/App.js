import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";

// Font imports
import "@fontsource/oxanium/400.css";
import "@fontsource/oxanium/600.css";
import "@fontsource/oxanium/700.css";
import "@fontsource/oxanium/800.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";

export default function App() {
  // All state declarations
  const [darkMode, setDarkMode] = useState(true);
  const [totalAmount, setTotalAmount] = useState("");
  const [members, setMembers] = useState("");
  const [currency, setCurrency] = useState("USDC");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState([]);
  const [history, setHistory] = useState([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");

  // Set page metadata
  useEffect(() => {
    document.title = "CryptoSplit — Split Crypto Payments Effortlessly";
    
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    updateMeta('description', 'Split cryptocurrency bills and generate payment links instantly. Built for teams and DAOs with secure, trackable crypto payments powered by KiraPay.');
    updateMeta('theme-color', darkMode ? '#030617' : '#4A70A9');
  }, [darkMode]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cs_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("cs_history", JSON.stringify(history));
    }
  }, [history]);

  const openQr = (value) => {
    setQrValue(value);
    setQrOpen(true);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy");
    }
  };

  const validateAddresses = (arr) => {
    return arr.every((a) => /^0x[a-fA-F0-9]{10,64}$/.test(a));
  };

  const generateLinks = async () => {
    setLoading(true);
    setLinks([]);

    try {
      const addrArr = members.split(",").map((s) => s.trim()).filter(Boolean);
      if (!addrArr.length)
        throw new Error("Enter at least one wallet address (comma-separated).");
      if (!totalAmount || Number(totalAmount) <= 0)
        throw new Error("Enter a valid total amount.");
      if (!validateAddresses(addrArr))
        throw new Error("Invalid wallet address format (must start with 0x...).");

      const share = (Number(totalAmount) / addrArr.length).toFixed(6);
      const generated = [];

      for (const addr of addrArr) {
        const res = await fetch(
          "https://kirapay-api.holatech.app/api/link/generate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.REACT_APP_KIRAPAY_API_KEY,
            },
            body: JSON.stringify({
              price: Number(share),
              currency,
              receiver: addr,
              name: `CryptoSplit: ${share} ${currency}`,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "KiraPay failed");

        generated.push({ address: addr, url: data.data.url, status: "PENDING" });
      }

      setLinks(generated);
      const entry = {
        id: Date.now(),
        total: Number(totalAmount),
        currency,
        members: generated.map((g) => g.address),
        links: generated,
        createdAt: new Date().toISOString(),
      };
      setHistory((h) => [entry, ...h]);
      toast.success("Payment links generated!");
    } catch (err) {
      toast.error(err.message || "Failed to generate links");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div
        className={`min-h-screen font-[Manrope] ${
          darkMode
            ? "bg-[#030617] text-white"
            : "bg-gradient-to-br from-[#EFECE3] to-[#4A70A9] text-black"
        }`}
      >
        <Toaster position="top-right" />

        {/* Background Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-40 left-1/4 w-[60rem] h-[60rem] rounded-full bg-gradient-to-r from-[#052B60]/40 via-[#1E5EA8]/30 to-[#06B6D4]/10 filter blur-3xl opacity-80"
            animate={{
              x: [0, -120, 0],
              y: [0, 30, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Navbar */}
        <header className="fixed top-6 left-1/2 transform -translate-x-1/2 w-[92%] md:w-3/4 z-50">
          <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-full px-6 py-3 flex justify-between items-center shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4A70A9] to-[#06B6D4] flex items-center justify-center font-[Oxanium] font-bold text-xl tracking-wider">
                CS
              </div>
              <div>
                <div className="text-lg font-[Oxanium] font-bold tracking-wide">
                  CryptoSplit
                </div>
                <div className="text-xs opacity-70">
                  Split payments. Stay sane.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 transition">
                Home
              </button>
              <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 transition">
                History
              </button>
              <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 transition">
                Docs
              </button>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <button
                onClick={() => setDarkMode((d) => !d)}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 transition"
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="pt-36 pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Section */}
              <div className="order-2 lg:order-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-5xl md:text-7xl font-[Oxanium] font-extrabold leading-[1.1] tracking-tight">
                    <span className="bg-clip-text bg-gradient-to-r from-[#4A70A9] via-[#06B6D4] to-[#8FABD4] text-transparent">
                      Split Crypto
                    </span>
                    <br />
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      Bills Effortlessly
                    </span>
                  </h1>
                  <p className="mt-6 text-lg text-gray-300 max-w-xl leading-relaxed">
                    Create and share cryptocurrency payment links instantly. Designed
                    for teams and DAOs — secure, trackable, and beautifully simple.
                  </p>
                  <div className="mt-8 flex gap-4">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-2xl font-[Oxanium] font-bold text-[#06B6D4]">
                        ⚡ Instant
                      </div>
                      <div className="text-xs opacity-70">No delays</div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-2xl font-[Oxanium] font-bold text-[#06B6D4]">
                        🔒 Secure
                      </div>
                      <div className="text-xs opacity-70">On-chain verified</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Form Card */}
              <div className="order-1 lg:order-2">
                <motion.div
                  className="relative p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl font-[Oxanium] font-bold mb-6">
                    Generate Split Links
                  </h2>

                  <label className="text-sm font-medium opacity-80">
                    Total Amount
                  </label>
                  <input
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="100"
                    type="number"
                    className="mt-2 w-full rounded-xl p-3.5 bg-black/20 border border-white/10 placeholder-gray-500 focus:outline-none focus:border-[#06B6D4] transition"
                  />

                  <label className="mt-5 block text-sm font-medium opacity-80">
                    Member Addresses (comma separated)
                  </label>
                  <textarea
                    value={members}
                    onChange={(e) => setMembers(e.target.value)}
                    placeholder="0xabc..., 0xdef..., 0x123..."
                    rows={3}
                    className="mt-2 w-full rounded-xl p-3.5 bg-black/20 border border-white/10 placeholder-gray-500 focus:outline-none focus:border-[#06B6D4] transition resize-none"
                  />

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="rounded-xl p-3.5 bg-black/20 border border-white/10 font-medium focus:outline-none focus:border-[#06B6D4] transition"
                    >
                      <option>USDC</option>
                      <option>USDT</option>
                      <option>ETH</option>
                    </select>

                    <button
                      onClick={generateLinks}
                      disabled={loading}
                      className="rounded-xl p-3.5 bg-gradient-to-r from-[#4A70A9] to-[#06B6D4] font-[Oxanium] font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Processing..." : "Split & Generate"}
                    </button>
                  </div>

                  {/* Generated Links */}
                  {links.length > 0 && (
                    <div className="mt-6 space-y-3 max-h-64 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                      {links.map((l, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-4 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-sm truncate opacity-90">
                                {l.address}
                              </div>
                              <a
                                href={l.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-[#06B6D4] hover:underline font-medium"
                              >
                                Open payment link →
                              </a>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => openQr(l.url)}
                                className="px-3 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 text-sm font-medium transition"
                                title="Show QR Code"
                              >
                                QR
                              </button>
                              <button
                                onClick={() => copyToClipboard(l.url)}
                                className="px-3 py-1.5 rounded-lg bg-white/6 hover:bg-white/10 text-sm font-medium transition"
                                title="Copy Link"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-10 text-center opacity-70">
          <div className="font-[Oxanium] text-lg mb-2">
            Built with ❤️ — CryptoSplit × KiraPay
          </div>
          <div className="text-sm">
            Powered by blockchain technology for transparent payments
          </div>
        </footer>

        {/* QR Modal */}
        {qrOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setQrOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white/10 p-8 rounded-2xl backdrop-blur-md border border-white/20 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 text-center">
                <div className="font-[Oxanium] text-2xl font-bold mb-2">
                  Scan to Pay
                </div>
                <div className="text-sm opacity-70">
                  Use any crypto wallet to scan this QR code
                </div>
              </div>
              <div className="mx-auto w-56 h-56 bg-white p-4 rounded-xl flex items-center justify-center">
                <QRCodeCanvas value={qrValue} size={200} level="H" />
              </div>
              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={() => copyToClipboard(qrValue)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-medium transition"
                >
                  📋 Copy Link
                </button>
                <button
                  onClick={() => setQrOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A70A9] to-[#06B6D4] font-[Oxanium] font-bold hover:shadow-lg transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
