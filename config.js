const firebase = require('firebase-admin');
const firebaseConfig = {
    apiKey: "AIzaSyDhOQrNX1PUIk5wueAayz_3R0NBuEth-vI",
    authDomain: "taigam-altai.firebaseapp.com",
    projectId: "taigam-altai",
    storageBucket: "taigam-altai.appspot.com",
    messagingSenderId: "490510450139",
    appId: "1:490510450139:web:eba45432cd158f1cdf7bfe",
    measurementId: "G-CCF3B5M26K"
  };
  const db = firebase.firestore()
  const Product = db.collection('products');
  module.exports = Product;