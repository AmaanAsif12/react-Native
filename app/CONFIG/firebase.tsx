import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { collection, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCt5PWrAjcWFtV1nIiPf3w1FR-qfJyyf5k",
  authDomain: "final-b121f.firebaseapp.com",
  projectId: "final-b121f",
  storageBucket: "final-b121f.appspot.com",
  messagingSenderId: "256691411883",
  appId: "1:256691411883:web:f43a626f951d2f6d26d0ee",
  measurementId: "G-QT1XLBQ9N3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
async function addLocation(rideData) {
  console.log(rideData);
  return addDoc(collection(db, "RidesInfo"), rideData);
}

export { addLocation, db, app };