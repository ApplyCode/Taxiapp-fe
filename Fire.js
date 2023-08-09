import * as firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyCZKPI8YaFW-z7EkP5xh9WM_qzEDlWnGFE",
    authDomain: "taxiwait-app-default-rtdb.firebaseio.com",
    databaseURL: "https://taxiwait-app-default-rtdb.firebaseio.com",
    projectId: "taxiwait-app",
    storageBucket: "taxiwait-app.appspot.com",
    messagingSenderId: "704548208125",
    appId: "1:704548208125:android:b27a24fee6abcb6214ad94",
    measurementId: "G-RS6QLBY2YP"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
export default firebase;
