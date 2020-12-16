import * as firebase from 'firebase';
require('@firebase/firestore')

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDj44BZDWdvJ5raFiAjsNdea4yLA6_GefE",
  authDomain: "booksanta-2d63a.firebaseapp.com",
  databaseURL: "https://booksanta-2d63a.firebaseio.com",
  projectId: "booksanta-2d63a",
  storageBucket: "booksanta-2d63a.appspot.com",
  messagingSenderId: "136050742913",
  appId: "1:136050742913:web:c85d92e03f2fc1f2185f80"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
