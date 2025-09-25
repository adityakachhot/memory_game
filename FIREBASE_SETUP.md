## Firebase setup for Memory Master

1) Create a Web App in Firebase Console for project `memory-master-41cca` and copy the config.

2) Create a `.env` file at the project root (not committed). Add:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=memory-master-41cca.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=memory-master-41cca
VITE_FIREBASE_STORAGE_BUCKET=memory-master-41cca.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

3) Restart dev server after changes. Vite exposes vars via `import.meta.env`.

4) Deploys:
- Netlify: Add the same variables in Site Settings → Build & deploy → Environment.
- Other hosts: define the same `VITE_...` variables for the build step.

Auth model
- Registration uses Firebase Email/Password and creates a `users/{uid}` doc with `username`, `email`, `createdAt`.
- Login uses email + password.

Files touched
- `client/lib/firebase.ts` initializes Firebase.
- `client/contexts/AuthContext.tsx` uses Firebase Auth + Firestore.
- `client/components/LoginModal.tsx` and `RegisterModal.tsx` use email/password.
