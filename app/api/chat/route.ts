import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { messages, language } = await req.json();

  const systemPrompt =
    language === "tr"
      ? "Sen Core AI adında yardımcı, zeki ve dostane bir yapay zeka asistansın. Türkçe konuşuyorsun. Kısa, net ve samimi cevaplar ver."
      : "You are Core AI, a helpful, smart and friendly AI assistant. Give concise, clear and genuine responses.";

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  const text = response.choices[0]?.message?.content || "";

  return NextResponse.json({ reply: text });
}