/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';

// In-memory OTP storage for verification fallback & rate limiting
interface StoredOtp {
  code: string;
  email: string;
  expiresAt: number; // 10 minutes timestamp
  attempts: number;
}

const otpStore = new Map<string, StoredOtp>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Route: Send 6-Digit OTP to Tutor Email (10 minutes expiration)
  app.post('/api/send-otp', async (req, res) => {
    try {
      const { email, uid, customOtp } = req.body;

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          error: 'Por favor ingresa un correo electrónico válido del tutor.',
        });
      }

      // Generate random 6-digit OTP or use provided cryptographic OTP
      const otpCode = customOtp || Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      const key = `${uid || ''}_${email.toLowerCase().trim()}`;
      otpStore.set(key, {
        code: otpCode,
        email: email.toLowerCase().trim(),
        expiresAt,
        attempts: 0,
      });

      console.log(`[Kindora Seguridad OTP] 🔐 Código de 6 dígitos para ${email}: [${otpCode}] (Válido por 10 minutos)`);

      // If RESEND_API_KEY / BREVO_API_KEY is configured, dispatch email to user inbox
      const resendKey = process.env.RESEND_API_KEY;
      const brevoKey = process.env.BREVO_API_KEY;
      let emailDispatched = false;
      let providerName = 'Consola de Seguridad Kindora';

      if (resendKey) {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: 'Kindora Seguridad <onboarding@resend.dev>',
              to: [email],
              subject: `Tu código de verificación Kindora: ${otpCode}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
                  <h2 style="color: #006399; margin-bottom: 8px;">🌟 Kindora Educación Infantil</h2>
                  <p style="color: #334155; font-size: 15px;">Hola, tutor responsable:</p>
                  <p style="color: #334155; font-size: 15px;">Usa el siguiente código de 6 dígitos para verificar tu cuenta y continuar con el perfil de tu pequeño:</p>
                  <div style="background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #006399;">${otpCode}</span>
                  </div>
                  <p style="color: #64748b; font-size: 13px;">⏰ Este código expirará en <strong>10 minutos</strong>. Si no solicitaste este código, puedes ignorar este mensaje.</p>
                </div>
              `,
            }),
          });
          if (response.ok) {
            emailDispatched = true;
            providerName = 'Resend Service';
          }
        } catch (mailErr) {
          console.warn('[Kindora Mail] Resend dispatch notice:', mailErr);
        }
      } else if (brevoKey) {
        try {
          const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': brevoKey,
            },
            body: JSON.stringify({
              sender: { name: 'Kindora Seguridad', email: 'seguridad@kindora.app' },
              to: [{ email }],
              subject: `Tu código de verificación Kindora: ${otpCode}`,
              htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
                  <h2 style="color: #006399; margin-bottom: 8px;">🌟 Kindora Educación Infantil</h2>
                  <p style="color: #334155; font-size: 15px;">Hola, tutor responsable:</p>
                  <p style="color: #334155; font-size: 15px;">Usa el siguiente código de 6 dígitos para verificar tu cuenta y continuar con el perfil de tu pequeño:</p>
                  <div style="background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #006399;">${otpCode}</span>
                  </div>
                  <p style="color: #64748b; font-size: 13px;">⏰ Este código expirará en <strong>10 minutos</strong>. Si no solicitaste este código, puedes ignorar este mensaje.</p>
                </div>
              `,
            }),
          });
          if (response.ok) {
            emailDispatched = true;
            providerName = 'Brevo Service';
          }
        } catch (brevoErr) {
          console.warn('[Kindora Mail] Brevo dispatch notice:', brevoErr);
        }
      }

      return res.json({
        success: true,
        message: `Código de seguridad de 6 dígitos enviado exitosamente a ${email}`,
        expiresAt,
        emailDispatched,
        provider: providerName,
      });
    } catch (err: any) {
      console.error('[Kindora OTP Error]', err);
      return res.status(500).json({
        success: false,
        error: 'Error al enviar código de verificación.',
      });
    }
  });

  // API Route: Verify OTP
  app.post('/api/verify-otp', (req, res) => {
    try {
      const { email, uid, code } = req.body;
      const key = `${uid || ''}_${email ? email.toLowerCase().trim() : ''}`;
      const record = otpStore.get(key);

      if (!record) {
        return res.status(400).json({
          success: false,
          error: 'No se encontró un código pendiente para este correo. Por favor solicita uno nuevo.',
        });
      }

      if (Date.now() > record.expiresAt) {
        otpStore.delete(key);
        return res.status(400).json({
          success: false,
          error: 'El código ha expirado (validez de 10 minutos). Solicita un nuevo código.',
        });
      }

      if (record.attempts >= 5) {
        otpStore.delete(key);
        return res.status(429).json({
          success: false,
          error: 'Demasiados intentos fallidos. Por seguridad solicita un nuevo código.',
        });
      }

      if (record.code.trim() !== String(code).trim()) {
        record.attempts += 1;
        return res.status(400).json({
          success: false,
          error: 'Código incorrecto. Revisa el número de 6 dígitos e intenta de nuevo.',
          remainingAttempts: 5 - record.attempts,
        });
      }

      // Valid OTP
      otpStore.delete(key);
      return res.json({
        success: true,
        message: '¡Verificación completada con éxito!',
        isOtpVerified: true,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: 'Error durante la verificación de código.' });
    }
  });

  // API Route: Export Complete Project Source Code as a ZIP
  app.get('/api/export-project-zip', async (req, res) => {
    try {
      const zip = new JSZip();
      const rootDir = process.cwd();

      const ignoredDirs = new Set(['node_modules', 'dist', '.git', '.cache', 'coverage', '.aistudio']);
      const ignoredFiles = new Set(['.DS_Store', 'bun.lock']);

      function addDirectoryToZip(currentDir: string, zipFolder: JSZip) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);

          if (entry.isDirectory()) {
            if (ignoredDirs.has(entry.name)) continue;
            const subFolder = zipFolder.folder(entry.name);
            if (subFolder) {
              addDirectoryToZip(fullPath, subFolder);
            }
          } else if (entry.isFile()) {
            if (ignoredFiles.has(entry.name)) continue;
            // Skip large temporary scrapers or py debug scripts if any
            if (entry.name.endsWith('.py') || entry.name.endsWith('.tmp')) continue;
            
            try {
              const fileContent = fs.readFileSync(fullPath);
              zipFolder.file(entry.name, fileContent);
            } catch (readErr) {
              console.warn('[Zip Exporter] Could not read file:', entry.name, readErr);
            }
          }
        }
      }

      addDirectoryToZip(rootDir, zip);

      const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="kindora-source-code.zip"');
      res.setHeader('Content-Length', zipBuffer.length);
      return res.send(zipBuffer);
    } catch (err: any) {
      console.error('[Kindora Export Error]', err);
      return res.status(500).json({
        success: false,
        error: 'No se pudo generar el archivo ZIP del código fuente.',
      });
    }
  });

  // Vite Middleware for SPA and Static assets
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { overlay: false, clientPort: 443 },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kindora server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
