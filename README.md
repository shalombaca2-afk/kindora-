# 🌟 Kindora - Plataforma Educativa Infantil

Kindora es una plataforma web interactiva y lúdica diseñada para niños de 3 a 5 años, con autenticación social para tutores (Google & Facebook), verificación de seguridad por correo (OTP de 6 dígitos con Resend/Brevo) y almacenamiento en Google Cloud Firestore.

---

## 🚀 Guía de Despliegue 100% Gratis en Firebase Hosting

Firebase Hosting ofrece un nivel gratuito generoso (10 GB de almacenamiento y 360 MB/día de transferencia de datos) con SSL automático y CDN global.

### Pasos Rápidos en tu Terminal:

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar la aplicación para producción (genera la carpeta dist/)
npm run build

# 3. Iniciar sesión en tu cuenta de Firebase/Google
npx firebase login

# 4. Inicializar Firebase Hosting en este directorio (selecciona tu proyecto existente)
npx firebase init hosting
# - Public directory: dist
# - Configure as a single-page app (rewrite all urls to /index.html): Yes
# - Set up automatic builds and deploys with GitHub: No
# - Overwrite dist/index.html: No

# 5. Desplegar a Firebase Hosting
npx firebase deploy --only hosting
```

---

## 🛠️ Ejecución en Desarrollo Local

```bash
# Iniciar servidor de desarrollo en http://localhost:3000
npm run dev
```

---

## 🔐 Configuración de Variables de Entorno (.env)

Crea un archivo `.env` en la raíz si deseas envío real de correos OTP mediante Resend o Brevo:

```env
# Opcional: Clave API de Resend (https://resend.com) para envío de correos OTP
RESEND_API_KEY=re_123456789

# Opcional: Clave API de Brevo (https://brevo.com) como proveedor alternativo
BREVO_API_KEY=xkeysib-...
```

---

## 📦 Estructura del Proyecto

- `src/` — Código fuente de React 19 + TypeScript + Tailwind CSS.
- `src/components/` — Vistas modulares (Home, Learn, Memory, Pet, Shop, Profile, Parents, Settings, Auth).
- `src/services/` — Integración con Firebase Authentication y Cloud Firestore.
- `server.ts` — Servidor Express para la API de verificación de códigos OTP de 6 dígitos.
- `firestore.rules` — Reglas de seguridad de Firestore para datos de niños y tutores.
- `firebase.json` — Configuración de hosting y reescritura para Single Page Application (SPA).
