import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const configuracao = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigurado = Boolean(
  configuracao.apiKey?.trim() && configuracao.authDomain?.trim()
  && configuracao.projectId?.trim() && configuracao.storageBucket?.trim()
  && configuracao.messagingSenderId?.trim() && configuracao.appId?.trim(),
);

const aplicacao = firebaseConfigurado
  ? getApps().length ? getApp() : initializeApp(configuracao)
  : null;

export const autenticacao = aplicacao ? getAuth(aplicacao) : null;
export const banco = aplicacao ? getFirestore(aplicacao) : null;
export const armazenamento = aplicacao ? getStorage(aplicacao) : null;
export const emailAdministrador = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'lukas.enginer7@gmail.com';
