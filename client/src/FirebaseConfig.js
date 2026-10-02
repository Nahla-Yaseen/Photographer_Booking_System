import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA8ecavFPo0DShhWrLiaNj-u_sqJNgekgY",
  authDomain: "photographerdb-da521.firebaseapp.com",
  projectId: "photographerdb-da521",
  storageBucket: "photographerdb-da521.firebasestorage.app",
  messagingSenderId: "798971707788",
  appId: "1:798971707788:web:fd2c46acf6bc90d8ae16a9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, database, auth, storage };
export default database;