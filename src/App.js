import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [totalAmount, setTotalAmount] = useState("");
  const [members, setMembers] = useState("");
  const [currency, setCurrency] = useState("USDC");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState([]);
  const [history, setHistory] = useState([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("cs_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cs_history", JSON.stringify(history));
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
          "https://kirapay.focalfossa.site/api/link/generate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key":
                process.env.REACT_APP_KIRAPAY_API_KEY || "[YOUR_API_KEY_HERE]",
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
        className={`min-h-screen font-[Instrument Sans] ${
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
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center font-bold text-xl">
                CS
              </div>
              <div>
                <div className="text-lg font-semibold">CryptoSplit</div>
                <div className="text-xs opacity-70">
                  Split payments. Stay sane.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="px-3 py-1 rounded-full text-sm bg-white/5 hover:bg-white/10 transition">
                Home
              </button>
              <button className="px-3 py-1 rounded-full text-sm bg-white/5 hover:bg-white/10 transition">
                History
              </button>
              <button className="px-3 py-1 rounded-full text-sm bg-white/5 hover:bg-white/10 transition">
                Docs
              </button>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <button
                onClick={() => setDarkMode((d) => !d)}
                className="px-3 py-1 rounded-full text-sm bg-white/5 hover:bg-white/10 transition"
              >
                {darkMode ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="pt-36 pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Text Section */}
              <div className="order-2 lg:order-1">
                <h1 className="text-4xl md:text-6xl font-[Plus Jakarta Sans] font-extrabold leading-tight tracking-tight">
                  <span className="bg-clip-text bg-gradient-to-r from-[#4A70A9] to-[#8FABD4] text-transparent">
                    Split crypto
                  </span>{" "}
                  bills effortlessly
                </h1>
                <p className="mt-4 text-gray-300 max-w-xl">
                  Create and share crypto payment links instantly. Designed for
                  teams and DAOs — secure, trackable, and beautiful.
                </p>
              </div>

              {/* Form Card */}
              <div className="order-1 lg:order-2">
                <motion.div
                  className="relative p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <label className="text-xs opacity-70">Total amount</label>
                  <input
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="100"
                    className="mt-2 w-full rounded-xl p-3 bg-black/10 border border-white/10 placeholder-gray-400 focus:outline-none"
                  />

                  <label className="mt-4 text-xs opacity-70">
                    Members (comma separated)
                  </label>
                  <input
                    value={members}
                    onChange={(e) => setMembers(e.target.value)}
                    placeholder="0xabc..., 0xdef..., 0x123..."
                    className="mt-2 w-full rounded-xl p-3 bg-black/10 border border-white/10 placeholder-gray-400 focus:outline-none"
                  />

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="rounded-xl p-3 bg-black/10 border border-white/10"
                    >
                      <option>USDC</option>
                      <option>USDT</option>
                      <option>ETH</option>
                    </select>

                    <button
                      onClick={generateLinks}
                      disabled={loading}
                      className="rounded-xl p-3 bg-gradient-to-r from-[#4A70A9] to-[#8FABD4] font-semibold"
                    >
                      {loading ? "Processing..." : "Split & Generate"}
                    </button>
                  </div>

                  {/* Generated Links */}
                  {links.length > 0 && (
                    <div className="mt-6 space-y-3 max-h-56 overflow-auto">
                      {links.map((l, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white/5 border border-white/8 flex items-center justify-between"
                        >
                          <div className="break-all">
                            <div className="font-medium">{l.address}</div>
                            <a
                              href={l.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-[#4A70A9] hover:underline"
                            >
                              Open link
                            </a>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-xs opacity-70">{l.status}</div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openQr(l.url)}
                                className="px-3 py-1 rounded-lg bg-white/6"
                              >
                                QR
                              </button>
                              <button
                                onClick={() => copyToClipboard(l.url)}
                                className="px-3 py-1 rounded-lg bg-white/6"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center opacity-70">
          Built with ❤️ — CryptoSplit and KiraPay
        </footer>

        {/* QR Modal */}
        {qrOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
            <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="mb-4 text-center">
                <div className="text-sm opacity-80">Scan to pay</div>
              </div>
              <div className="mx-auto w-56">
               <QRCodeCanvas value={qrValue} size={200} />
              </div>
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={() => {
                    copyToClipboard(qrValue);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/6"
                >
                  Copy link
                </button>
                <button
                  onClick={() => setQrOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/6"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
