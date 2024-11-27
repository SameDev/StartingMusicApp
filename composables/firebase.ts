import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCqJXOSd1VhETCBQ5OpsGKfXbVxfDxyfGw",
  authDomain: "startingmusicstorage.firebaseapp.com",
  projectId: "startingmusicstorage",
  storageBucket: "startingmusicstorage.appspot.com",
  messagingSenderId: "921269950387",
  appId: "1:921269950387:web:88ec3b6519b20a4550ddc6"
};


const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const storageRef = ref(storage);

const FireRef = ref

export { FireRef, uploadBytes, getDownloadURL }