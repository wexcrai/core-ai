import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, createUsersTable, getUserByUsername, getUserByEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    await createUsersTable();

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ error: "Bu kullanıcı adı zaten alınmış." }, { status: 400 });
    }

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: "Bu email zaten kayıtlı." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(username, email, hashedPassword);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}