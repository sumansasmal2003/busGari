import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDptUQfqpGdNJZ8scFnyK7dDsc0M1jqcHM",
    authDomain: "bus-root-2e659.firebaseapp.com",
    databaseURL: "https://bus-root-2e659-default-rtdb.firebaseio.com",
    projectId: "bus-root-2e659",
    storageBucket: "bus-root-2e659.appspot.com",
    messagingSenderId: "643928615251",
    appId: "1:643928615251:web:fc309b224d97ec4c5b19a6",
    measurementId: "G-D6ZBXCYNDY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
