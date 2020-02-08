const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

const gamesCollection = db.collection('games');
const picturesCollection = db.collection('pictures');
const playersCollection = db.collection('players');
const randomQuips = db.collection('randomQuips');

const FieldValue = admin.firestore.FieldValue;

module.exports.server = {
  functions,
};

module.exports.firestore = {
  db,
  gamesCollection,
  picturesCollection,
  playersCollection,
  randomQuips,
  FieldValue,
};