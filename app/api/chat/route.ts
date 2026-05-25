import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const language = formData.get("language") as string;
  const messagesRaw = formData.get("messages") as string;
  const image = formData.get("image") as File | null;
  const file = formData.get("file") as File | null;

  const messages = JSON.parse(messagesRaw);

  const systemPrompt =
    language === "tr"
      ? "Sen Core AI adında yardımcı, zeki ve dostane bir yapay zeka asistansın. Türkçe konuşuyorsun. Kısa, net ve samimi cevaplar ver."
      : "You are Core AI, a helpful, smart and friendly AI assistant. Give concise, clear and genuine responses.";

  let lastMessage = messages[messages.length - 1];

  if (image) {
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type;

    lastMessage = {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64}` },
        },
        {
          type: "text",
          text: lastMessage.content || (language === "tr" ? "Bu görseli analiz et." : "Analyze this image."),
        },
      ],
    };
  } else if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileText = buffer.toString("utf-8").slice(0, 8000);
    const userQuestion = lastMessage.content || (language === "tr" ? "Bu dosyayı analiz et." : "Analyze this file.");
    lastMessage = {
      role: "user",
      content: `${userQuestion}\n\n--- DOSYA İÇERİĞİ (${file.name}) ---\n${fileText}`,
    };
  }

  const finalMessages = [...messages.slice(0, -1), lastMessage];

  const response = await client.chat.completions.create({
    model: image ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...finalMessages,
    ],
  });

  const text = response.choices[0]?.message?.content || "";
  return NextResponse.json({ reply: text });
}