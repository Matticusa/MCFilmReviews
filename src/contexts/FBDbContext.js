import { createContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config/Config';

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export const FBDbContext = createContext(firestore);