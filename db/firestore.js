const admin = require('firebase-admin');
const serviceAccount = require('../wiki-huh-firebase-adminsdk-my2qj-5feb5ffdaa');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const gamesCollection = db.collection('games');
const picturesCollection = db.collection('pictures');
const playersCollection = db.collection('players');
const randomQuips = db.collection('randomQuips');

const FieldValue = admin.firestore.FieldValue;

module.exports.firestore = {
  db,
  gamesCollection,
  picturesCollection,
  playersCollection,
  randomQuips,
  FieldValue,
};