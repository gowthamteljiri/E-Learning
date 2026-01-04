// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDeNYYS_kpFQ5uClsvX_fwvvsbtK0iTNkA",
  authDomain: "mr-technology-d20b5.firebaseapp.com",
  projectId: "mr-technology-d20b5",
  storageBucket: "mr-technology-d20b5.appspot.com",
  messagingSenderId: "394488997382",
  appId: "1:394488997382:web:933be4c0d5a8e83e840587"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
