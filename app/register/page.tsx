"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (data.error) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "48px 40px", background: "#111118", border: "1px solid #1e1e2e", borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#4a4af4,#9b59f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 22, marginBottom: 16, boxShadow: "0 8px 24px rgba(74,74,244,0.4)" }}>C</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>Core AI</h1>
          <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>Yeni hesap oluşturun</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#aaa", display: "block", marginBottom: 6 }}>KULLANICI ADI</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="kullanici_adi" style={{ width: "100%", padding: "12px 14px", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#aaa", display: "block", marginBottom: 6 }}>EMAIL</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" style={{ width: "100%", padding: "12px 14px", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#aaa", display: "block", marginBottom: 6 }}>ŞİFRE</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" onKeyDown={(e) => e.key === "Enter" && handleRegister()} style={{ width: "100%", padding: "12px 14px", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>
              {error}
            </div>
          )}

          <button onClick={handleRegister} disabled={loading} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#4a4af4,#9b59f7)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4, fontFamily: "inherit" }}>
            {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
          </button>

          <p style={{ fontSize: 13, color: "#666", textAlign: "center", marginTop: 8 }}>
            Zaten hesabın var mı?{" "}
            <Link href="/login" style={{ color: "#4a4af4", textDecoration: "none" }}>Giriş yap</Link>
          </p>
        </div>

        <p style={{ fontSize: 12, color: "#444", textAlign: "center", marginTop: 24 }}>Core AI — Güvenli Yapay Zeka Platformu</p>
      </div>
    </div>
  );
}