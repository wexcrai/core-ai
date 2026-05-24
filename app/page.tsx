"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Message = { role: "user" | "assistant"; content: string; image?: string };
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
    imageAnalyze: "Bu görseli analiz et.",
    fileAnalyze: "Bu dosyayı analiz et.",
  },
  en: {
    placeholder: "Type a message...",
    status: "Online",
    typing: "Typing...",
    empty: "Hello! How can I help you today?",
    chips: ["Write code", "Summarize text", "Ask a question", "Give ideas"],
    error: "Something went wrong, please try again.",
    imageAnalyze: "Analyze this image.",
    fileAnalyze: "Analyze this file.",
  },
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<Lang>("tr");
  const [theme, setTheme] = useState<Theme>("light");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDocRef = useRef<HTMLInputElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = i18n[lang];

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (status === "loading" || !session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f" }}>
        <div style={{ color: "#666", fontSize: 14 }}>Yükleniyor...</div>
      </div>
    );
  }

  const getTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileDocRef.current) fileDocRef.current.value = "";
  };

  const send = async (text: string) => {
    if ((!text.trim() && !selectedImage && !selectedFile) || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text || (selectedImage ? t.imageAnalyze : t.fileAnalyze),
      image: imagePreview || undefined,
    };

    const apiMessages = [...messages, { role: "user" as const, content: text || (selectedImage ? t.imageAnalyze : t.fileAnalyze) }];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const formData = new FormData();
    formData.append("messages", JSON.stringify(apiMessages));
    formData.append("language", lang);
    if (selectedImage) formData.append("image", selectedImage);
    if (selectedFile) formData.append("file", selectedFile);

    setSelectedImage(null);
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (fileDocRef.current) fileDocRef.current.value = "";

    try {
      const res = await fetch("/api/chat", { method: "POST", body: formData });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t.error }]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const canSend = (input.trim() || selectedImage || selectedFile) && !loading;

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
            <span style={{ fontSize: 12, color: "var(--text2)" }}>👤 {session.user?.name}</span>
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              {(["tr", "en"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 11px", fontSize: 12, border: "none", background: lang === l ? "#4a4af4" : "transparent", color: lang === l ? "#fff" : "var(--text2)", cursor: "pointer" }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} style={{ width: 32, height: 32, border: "1px solid var(--border)", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 16 }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button onClick={() => signOut({ callbackUrl: "/login" })} style={{ padding: "5px 12px", fontSize: 12, border: "1px solid var(--border)", borderRadius: 8, background: "transparent", color: "var(--text2)", cursor: "pointer" }}>
              Çıkış
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
                {m.role === "assistant" ? "C" : (session.user?.name?.[0]?.toUpperCase() || "U")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.image && (
                  <img src={m.image} alt="uploaded" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 10, objectFit: "cover" }} />
                )}
                <div style={{ padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.6, background: m.role === "user" ? "#4a4af4" : "var(--bubble-ai)", color: m.role === "user" ? "#fff" : "var(--bubble-ai-text)", borderBottomRightRadius: m.role === "user" ? 4 : 14, borderBottomLeftRadius: m.role === "assistant" ? 4 : 14, border: m.role === "assistant" ? "1px solid var(--border)" : "none", whiteSpace: "pre-wrap" }}>
                  {m.content}
                </div>
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

        {/* Image Preview */}
        {imagePreview && (
          <div style={{ padding: "0 18px 10px", display: "flex", alignItems: "center", gap: 10 }}>
            <img src={imagePreview} alt="preview" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", border: "1px solid var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text2)" }}>{selectedImage?.name}</span>
            <button onClick={removeImage} style={{ fontSize: 12, color: "#f87171", background: "transparent", border: "none", cursor: "pointer" }}>✕ Kaldır</button>
          </div>
        )}

        {/* File Preview */}
        {selectedFile && (
          <div style={{ padding: "0 18px 10px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📄</span>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>{selectedFile.name}</span>
            <button onClick={removeFile} style={{ fontSize: 12, color: "#f87171", background: "transparent", border: "none", cursor: "pointer" }}>✕ Kaldır</button>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
          <input ref={fileDocRef} type="file" accept=".pdf,.txt,.md" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
          <button onClick={() => fileInputRef.current?.click()} title="Görsel yükle" style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: 18, color: "var(--text2)", flexShrink: 0 }}>
            🖼
          </button>
          <button onClick={() => fileDocRef.current?.click()} title="Dosya yükle (PDF, TXT)" style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: 18, color: "var(--text2)", flexShrink: 0 }}>
            📄
          </button>
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
            disabled={!canSend}
            style={{ width: 36, height: 36, borderRadius: 10, background: "#4a4af4", border: "none", cursor: canSend ? "pointer" : "not-allowed", color: "#fff", fontSize: 18, opacity: canSend ? 1 : 0.4, flexShrink: 0 }}
          >
            ↑
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,60%,100% { transform:translateY(0) } 30% { transform:translateY(-6px) } }`}</style>
    </div>
  );
}