"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };
type Lang = "tr" | "en";
type Theme = "light" | "dark";

const i18n = {
  tr: {
    placeholder: "Bir mesaj yaz...",
    status: "Çevrimiçi",
    typing: "Yazıyor...",
    empty: "Merhaba! Sana nasıl yardımcı olabilirim?",
    chips: ["Kod yaz", "Metin özetle", "Soru sor", "Fikir ver"],
    error: "Bir hata oluştu, tekrar dene.",
  },
  en: {
    placeholder: "Type a message...",
    status: "Online",
    typing: "Typing...",
    empty: "Hello! How can I help you today?",
    chips: ["Write code", "Summarize text", "Ask a question", "Give ideas"],
    error: "Something went wrong, please try again.",
  },
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<Lang>("tr");
  const [theme, setTheme] = useState<Theme>("light");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = i18n[lang];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, language: lang }),
      });
      const data = await res.json();
      setMessages([...newHistory, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: t.error }]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "700px", height: "600px", display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", background: "var(--bg)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4a4af4,#9b59f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>C</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)" }}>Core AI</div>
              <div style={{ fontSize: 11, color: "var(--text2)" }}>{loading ? t.typing : t.status}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              {(["tr", "en"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 11px", fontSize: 12, border: "none", background: lang === l ? "#4a4af4" : "transparent", color: lang === l ? "#fff" : "var(--text2)", cursor: "pointer" }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} style={{ width: 32, height: 32, border: "1px solid var(--border)", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 16, color: "var(--text2)" }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5, fontSize: 14, color: "var(--text2)" }}>
              {t.empty}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, maxWidth: "85%", alignSelf: m.role === "user" ? "flex-end" : "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: m.role === "assistant" ? "linear-gradient(135deg,#4a4af4,#9b59f7)" : "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: m.role === "assistant" ? "#fff" : "var(--text2)", flexShrink: 0, marginTop: 2, border: m.role === "user" ? "1px solid var(--border)" : "none" }}>
                {m.role === "assistant" ? "C" : "S"}
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.6, background: m.role === "user" ? "#4a4af4" : "var(--bubble-ai)", color: m.role === "user" ? "#fff" : "var(--bubble-ai-text)", borderBottomRightRadius: m.role === "user" ? 4 : 14, borderBottomLeftRadius: m.role === "assistant" ? 4 : 14, border: m.role === "assistant" ? "1px solid var(--border)" : "none", whiteSpace: "pre-wrap" }}>
                {m.content}
              </div>
              <div style={{ fontSize: 10, color: "var(--text2)", alignSelf: "flex-end", paddingBottom: 2 }}>{getTime()}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 10, alignSelf: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#4a4af4,#9b59f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#fff" }}>C</div>
              <div style={{ padding: "12px 16px", background: "var(--bubble-ai)", border: "1px solid var(--border)", borderRadius: 14, borderBottomLeftRadius: 4, display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--text2)", animation: `bounce 0.9s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Chips */}
        {messages.length === 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 18px 12px" }}>
            {t.chips.map((c) => (
              <button key={c} onClick={() => send(c)} style={{ fontSize: 12, padding: "5px 12px", border: "1px solid var(--border)", borderRadius: 20, background: "transparent", color: "var(--text2)", cursor: "pointer" }}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, display: "flex", alignItems: "flex-end", padding: "2px 4px 2px 14px" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); resizeTextarea(); }}
              onKeyDown={handleKey}
              placeholder={t.placeholder}
              rows={1}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "var(--text)", resize: "none", maxHeight: 120, minHeight: 36, padding: "8px 0", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{ width: 36, height: 36, borderRadius: 10, background: "#4a4af4", border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed", color: "#fff", fontSize: 18, opacity: input.trim() && !loading ? 1 : 0.4, flexShrink: 0 }}
          >
            ↑
          </button>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,60%,100% { transform:translateY(0) } 30% { transform:translateY(-6px) } }`}</style>
    </div>
  );
}