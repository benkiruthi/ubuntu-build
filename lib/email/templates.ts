const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://build.ebbli.co";

const wrap = (body: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; color: #111827; }
    .container { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #b45309, #78350f); padding: 32px 40px; }
    .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px; }
    .body { padding: 32px 40px; }
    .body p { font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 12px 24px; background: #b45309; color: white !important; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
    .footer { padding: 20px 40px; border-top: 1px solid #f3f4f6; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 0; }
    .highlight { background: #fef3c7; border-left: 3px solid #b45309; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ebbli Build</h1>
      <p>AI-powered AEC platform for East Africa</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Ebbli Build · <a href="${BASE_URL}" style="color:#b45309">build.ebbli.co</a></p>
      <p style="margin-top:4px">You received this email because you have an Ebbli Build account.</p>
    </div>
  </div>
</body>
</html>`;

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to Ebbli Build — your AI AEC platform",
    html: wrap(`
      <p>Hello ${name || "there"} 👋</p>
      <p>Welcome to <strong>Ebbli Build</strong> — East Africa's AI-powered platform for architecture, engineering, and construction.</p>
      <p>Here's what you can do right now:</p>
      <div class="highlight">
        🏛️ <strong>AI Architect</strong> — describe your dream building and get a full design brief<br>
        📐 <strong>QS AI</strong> — generate an instant Bill of Quantities with Kenyan market prices<br>
        📁 <strong>File Manager</strong> — store your drawings, contracts, and documents<br>
        🔍 <strong>Marketplace</strong> — connect with verified professionals across Kenya
      </div>
      <p style="margin-top:24px">
        <a href="${BASE_URL}/dashboard" class="btn">Go to your dashboard →</a>
      </p>
      <p style="margin-top:24px; font-size:13px; color:#6b7280">
        Questions? Reply to this email — we read every message.
      </p>
    `),
  };
}

export function subscriptionConfirmEmail(
  name: string,
  tier: string,
  expiresAt: string
): { subject: string; html: string } {
  return {
    subject: `Your ${tier} plan is now active 🎉`,
    html: wrap(`
      <p>Hello ${name || "there"} 🎉</p>
      <p>Your <strong>${tier} plan</strong> is now active on Ebbli Build.</p>
      <div class="highlight">
        Plan: <strong>${tier}</strong><br>
        Active until: <strong>${new Date(expiresAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</strong>
      </div>
      <p>Your new AI modules are unlocked and ready to use.</p>
      <p style="margin-top:24px">
        <a href="${BASE_URL}/dashboard" class="btn">Start building →</a>
      </p>
    `),
  };
}

export function projectMilestoneEmail(
  name: string,
  projectName: string,
  milestone: string,
  projectId: string
): { subject: string; html: string } {
  return {
    subject: `${projectName} — ${milestone}`,
    html: wrap(`
      <p>Hello ${name || "there"},</p>
      <p>There's an update on your project <strong>${projectName}</strong>:</p>
      <div class="highlight">${milestone}</div>
      <p style="margin-top:24px">
        <a href="${BASE_URL}/projects/${projectId}" class="btn">View project →</a>
      </p>
    `),
  };
}

export function paymentFailedEmail(
  name: string,
  amount: number
): { subject: string; html: string } {
  return {
    subject: "Payment issue on your Ebbli Build account",
    html: wrap(`
      <p>Hello ${name || "there"},</p>
      <p>We were unable to confirm your payment of <strong>KES ${amount.toLocaleString()}</strong>.</p>
      <p>This can happen if:</p>
      <ul style="font-size:14px; color:#374151; line-height:1.8">
        <li>The M-Pesa transaction was cancelled</li>
        <li>Insufficient funds at the time of payment</li>
        <li>A network issue interrupted the payment</li>
      </ul>
      <p style="margin-top:24px">
        <a href="${BASE_URL}/settings/billing" class="btn">Try again →</a>
      </p>
      <p style="font-size:13px; color:#6b7280; margin-top:16px">
        If you believe you were charged but your plan wasn't upgraded, reply to this email with your M-Pesa confirmation code.
      </p>
    `),
  };
}
