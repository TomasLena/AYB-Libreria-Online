// firebase-config.js

import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';

const firebaseConfig = {
  apiKey: "AIzaSyAiHUJNINl_NlkUFhdgI-XZq_kRn2tyYog",
  authDomain: "papeleria-ayb.firebaseapp.com",
  projectId: "papeleria-ayb",
  storageBucket: "papeleria-ayb.appspot.com",
  messagingSenderId: "169590579451",
  appId: "1:169590579451:web:a89b52bdc6f8a01908d05e"
};

const app = initializeApp(firebaseConfig);

export { app };
