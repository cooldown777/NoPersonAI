interface MagicLinkEmailParams {
  url: string;
  host: string;
}

export function magicLinkEmail({ url, host }: MagicLinkEmailParams) {
  const subject = `Sign in to NoPersonAI`;
  const text = `Sign in to NoPersonAI\n\nClick the link below to sign in — it expires in 24 hours.\n\n${url}\n\nIf you did not request this email you can safely ignore it.\n\n— NoPersonAI · ${host}\n`;

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #e4e4e7;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 0 32px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#6366F1,#4F46E5);color:#fff;font-weight:800;display:inline-block;text-align:center;line-height:32px;">N</div>
                    </td>
                    <td style="vertical-align:middle;padding-left:10px;font-weight:700;font-size:16px;color:#18181b;letter-spacing:-0.01em;">NoPerson<span style="color:#4F46E5;">AI</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.25;color:#18181b;letter-spacing:-0.01em;">Sign in to NoPersonAI</h1>
                <p style="margin:0;color:#52525b;font-size:15px;line-height:1.55;">Click the button below to sign in. The link expires in 24 hours and can only be used once.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <a href="${url}" style="display:inline-block;background:#4F46E5;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 20px;border-radius:12px;">Sign in</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.5;">Or copy and paste this URL:<br/><span style="color:#4F46E5;word-break:break-all;">${url}</span></p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f4f4f5;">
                <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.5;">If you did not request this email, you can safely ignore it.<br/>NoPersonAI · ${host}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
