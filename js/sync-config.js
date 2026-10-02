/* Cloud sync between your phone and laptop (optional).
   1. Follow "Sync progress between devices" in README.md to create a free Firebase project.
   2. Replace null below with the config object Firebase gives you, for example:

   window.FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "gre-brain-lag.firebaseapp.com",
     projectId: "gre-brain-lag",
     appId: "1:1234567890:web:abc123"
   };

   These values are safe to publish: your Firestore security rules (see README)
   are what keep each person's progress private. Leave it as null to turn sync off. */
window.FIREBASE_CONFIG = null;
