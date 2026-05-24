"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (res?.ok) {
      router.push("/");
    } else {
      setError("Kullanıcı adı veya şifre hatalı.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "48px 40px", background: "#111118", border: "1px solid #1e1e2e", borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#4a4af4,#9b59f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 22, marginBottom: 16, boxShadow: "0 8px 24px rgba(74,74,244,0.4)" }}>C</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>Core AI</h1>
          <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>Hesabınıza giriş yapın</p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#aaa", display: "block", marginBottom: 6 }}>KULLANICI ADI</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="kullanici_adi"
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f0", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#aaa", display: "block", marginBottom: 6 }}>ŞİFRE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px 14px", background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 10, color: "#f0f0f0", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#4a4af4,#9b59f7)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4, fontFamily: "inherit" }}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </div>
<p style={{ fontSize: 13, color: "#666", textAlign: "center", marginTop: 8 }}>
  Hesabın yok mu?{" "}
  <a href="/register" style={{ color: "#4a4af4", textDecoration: "none" }}>Kayıt ol</a>
</p>
        <p style={{ fontSize: 12, color: "#444", textAlign: "center", marginTop: 24 }}>Core AI — Güvenli Yapay Zeka Platformu</p>
      </div>
    </div>
  );
}