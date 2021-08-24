import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/firebase-functions';

var firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};


firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const currentTimestamp = firebase.firestore.Timestamp;
export const auth = firebase.auth();
export const storage = firebase.storage();
export const functions = firebase.functions();
