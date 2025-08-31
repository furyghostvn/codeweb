// api/claim.ts  — safe: only logs wallet; redacts secrets
import type { VercelRequest, VercelResponse } from "vercel";

const BOT  = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT = process.env.TELEGRAM_CHAT_ID!;



export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { wallet } = (req.body ?? {}) as { wallet?: string };

    const ip = String((req.headers["x-forwarded-for"] as string || "").split(",")[0].trim());
    const ua = String(req.headers["user-agent"] || "");

    const safeWallet = String(wallet ?? "");

    const text =
`New wallet claim
Wallet: ${safeWallet}
IP: ${ip || "n/a"}
UA: ${ua.slice(0, 160)}`;

    const tg = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT, text }),
    });

    if (!tg.ok) return res.status(400).json({ error: await tg.text() });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
