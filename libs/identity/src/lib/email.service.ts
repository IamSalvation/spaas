import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly resend: Resend | null;
    private readonly fromEmail: string;
    private readonly adminEmail: string;
    private readonly appUrl: string;

    constructor() {
        const apiKey = process.env['RESEND_API_KEY'];
        this.fromEmail = process.env['PLATFORM_FROM_EMAIL'] || 'notifications@spaas.quickie-studio.com';
        this.adminEmail = process.env['PLATFORM_ADMIN_EMAIL'] || '';
        this.appUrl = process.env['PLATFORM_APP_URL'] || 'https://spaas.quickie-studio.com';
        this.resend = apiKey ? new Resend(apiKey) : null;
        if (!this.resend) {
            this.logger.warn('RESEND_API_KEY is missing — email sending is disabled');
        }
    }

    // ---------------- 1. WELCOME EMAIL (to new tenant) ----------------
    async sendWelcomeEmail(params: {
        to: string;
        companyName: string;
        slug: string;
        loginEmail: string;
    }) {
        if (!this.resend) return;
        const { to, companyName, slug, loginEmail } = params;

        try {
            await this.resend.emails.send({
                from: `SPAAS <${this.fromEmail}>`,
                to: [to],
                subject: `🎉 Welcome to SPAAS, ${companyName}!`,
                html: this.renderEmail({
                    title: `Welcome to SPAAS, ${companyName}!`,
                    preheader: `Your workspace is ready. Log in now.`,
                    body: `
            <p>Hi there,</p>
            <p>Your SPAAS workspace has been created successfully. You're now ready to manage your business — from sales and inventory to manufacturing and finance.</p>

            <div class="info-box">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #a78bfa; text-transform: uppercase; letter-spacing: 1px;">Your Workspace</h3>
              <table style="width: 100%; font-size: 14px;">
                <tr><td style="color: #9ca3af; padding: 4px 0;">Company</td><td style="color: #fff; font-weight: 600; text-align: right;">${companyName}</td></tr>
                <tr><td style="color: #9ca3af; padding: 4px 0;">Workspace slug</td><td style="color: #fff; font-weight: 600; text-align: right; font-family: monospace;">${slug}</td></tr>
                <tr><td style="color: #9ca3af; padding: 4px 0;">Login email</td><td style="color: #fff; font-weight: 600; text-align: right;">${loginEmail}</td></tr>
              </table>
            </div>

            <p>Click the button below to log in to your workspace:</p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${this.appUrl}/login" class="button">Log in to SPAAS</a>
            </div>

            <h3 style="font-size: 16px; color: #fff; margin-top: 32px;">What you can do next:</h3>
            <ul style="color: #d1d5db; font-size: 14px; line-height: 1.8;">
              <li>Add your items, customers, and vendors in <strong>Master Data</strong></li>
              <li>Record your first sale from the <strong>Sales</strong> page</li>
              <li>Purchase inventory from <strong>Procurement</strong></li>
              <li>Run production orders from <strong>Manufacturing</strong></li>
              <li>Invite your team from the <strong>Team</strong> page</li>
            </ul>

            <p style="margin-top: 32px;">If you have any questions, just reply to this email.</p>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">— The SPAAS team</p>
          `,
                }),
            });
            this.logger.log(`Welcome email sent to ${to}`);
        } catch (err: any) {
            this.logger.error(`Failed to send welcome email to ${to}: ${err.message}`);
        }
    }

    // ---------------- 2. ADMIN ALERT (to you, the owner) ----------------
    async sendNewSignupAlert(params: {
        companyName: string;
        slug: string;
        ownerEmail: string;
        tenantId: string;
    }) {
        if (!this.resend || !this.adminEmail) return;
        const { companyName, slug, ownerEmail, tenantId } = params;

        try {
            await this.resend.emails.send({
                from: `SPAAS <${this.fromEmail}>`,
                to: [this.adminEmail],
                subject: `🎉 New signup: ${companyName}`,
                html: this.renderEmail({
                    title: `New signup: ${companyName}`,
                    preheader: `${ownerEmail} just created a new SPAAS workspace.`,
                    body: `
            <p>A new company just signed up for SPAAS.</p>

            <div class="info-box">
              <table style="width: 100%; font-size: 14px;">
                <tr><td style="color: #9ca3af; padding: 4px 0;">Company</td><td style="color: #fff; font-weight: 600; text-align: right;">${companyName}</td></tr>
                <tr><td style="color: #9ca3af; padding: 4px 0;">Workspace slug</td><td style="color: #fff; font-weight: 600; text-align: right; font-family: monospace;">${slug}</td></tr>
                <tr><td style="color: #9ca3af; padding: 4px 0;">Owner email</td><td style="color: #fff; font-weight: 600; text-align: right;">${ownerEmail}</td></tr>
                <tr><td style="color: #9ca3af; padding: 4px 0;">Tenant ID</td><td style="color: #6b7280; text-align: right; font-family: monospace; font-size: 11px;">${tenantId}</td></tr>
              </table>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${this.appUrl}/platform/tenants/${tenantId}" class="button">View in Platform Console</a>
            </div>

            <p style="color: #9ca3af; font-size: 13px; text-align: center;">This email was sent to you because you are the platform admin of SPAAS.</p>
          `,
                }),
            });
            this.logger.log(`New signup alert sent to ${this.adminEmail} for ${companyName}`);
        } catch (err: any) {
            this.logger.error(`Failed to send admin alert: ${err.message}`);
        }
    }

    // ---------------- 3. PAUSE NOTIFICATION (to tenant) ----------------
    async sendPausedEmail(params: {
        to: string;
        companyName: string;
    }) {
        if (!this.resend) return;
        const { to, companyName } = params;

        try {
            await this.resend.emails.send({
                from: `SPAAS <${this.fromEmail}>`,
                to: [to],
                subject: `Your SPAAS account has been paused`,
                html: this.renderEmail({
                    title: 'Your account has been paused',
                    preheader: `Your SPAAS workspace for ${companyName} has been temporarily paused.`,
                    body: `
            <p>Hi there,</p>

            <div class="warning-box">
              <strong style="color: #fbbf24;">Your SPAAS workspace has been temporarily paused.</strong>
              <p style="margin: 8px 0 0 0; color: #d1d5db; font-size: 14px;">
                While your account is paused, you won't be able to log in or access your data.
                Your data is safe and has not been deleted.
              </p>
            </div>

            <p>This usually happens when:</p>
            <ul style="color: #d1d5db; font-size: 14px; line-height: 1.8;">
              <li>There's an outstanding invoice on your account</li>
              <li>You requested a temporary pause</li>
              <li>There's a security concern we need to discuss</li>
            </ul>

            <p style="margin-top: 24px;">To restore your account, please contact us by replying to this email.</p>

            <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">— The SPAAS team</p>
          `,
                }),
            });
            this.logger.log(`Pause notification sent to ${to}`);
        } catch (err: any) {
            this.logger.error(`Failed to send pause email: ${err.message}`);
        }
    }

    // ---------------- Shared template wrapper ----------------
    private renderEmail(opts: { title: string; preheader: string; body: string }): string {
        return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${opts.title}</title>
<style>
  body { margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background-color: #1f2937; border-radius: 12px; border: 1px solid #374151; overflow: hidden; }
  .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; text-align: center; }
  .header h1 { margin: 0; font-size: 28px; color: #ffffff; font-weight: 800; letter-spacing: -0.5px; }
  .header p { margin: 4px 0 0 0; color: #e9d5ff; font-size: 14px; }
  .content { padding: 32px; color: #d1d5db; font-size: 15px; line-height: 1.6; }
  .content h2 { color: #ffffff; font-size: 22px; margin: 0 0 16px 0; }
  .info-box { background-color: #111827; border-left: 3px solid #a855f7; padding: 16px 20px; border-radius: 8px; margin: 24px 0; }
  .warning-box { background-color: #451a03; border-left: 3px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 24px 0; }
  .button { display: inline-block; background-color: #7c3aed; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }
  .button:hover { background-color: #6d28d9; }
  .footer { text-align: center; padding: 24px 20px 0 20px; color: #6b7280; font-size: 12px; }
  a { color: #a78bfa; }
</style>
</head>
<body>
  <div style="display: none; max-height: 0; overflow: hidden;">${opts.preheader}</div>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>SPAAS</h1>
        <p>Software & Product As A Service</p>
      </div>
      <div class="content">
        <h2>${opts.title}</h2>
        ${opts.body}
      </div>
    </div>
    <div class="footer">
      <p>Sent by SPAAS · <a href="${this.appUrl}">${this.appUrl}</a></p>
      <p>This is an automated message. Please do not reply directly unless instructed.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    }
}