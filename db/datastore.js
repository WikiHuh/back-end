const games = require('./firestore').firestore.gamesCollection;
const pictures = require('./firestore').firestore.picturesCollection;
const players = require('./firestore').firestore.playersCollection;
const randomQuips = require('./firestore').firestore.randomQuips;
const FieldValue = require('./firestore').firestore.FieldValue;

const Security = require('../lib/Security');

const createUser = (name) => {
  const playerKey = Security.getRandomString(16);
  return players.add({
    name: name,
    score: 0,
    key: playerKey,
  }).then(docRef => {
    return docRef.id;
  });
};

const addUserToGame = (userKey, pin) => {
  // check if game exists
  return new Promise((resolve, reject) => {
    const gameQuery = games.where('pin', '==', pin);
    gameQuery.get().then(snapshot => {
      if (!snapshot.empty) {
        gameQuery.update({users: FieldValue.arrayUnion(userKey)}).then(() => resolve()).catch(err => reject(err));
      } else {
        reject('Game does not exist');
      }
    }).catch(err => {
      reject('Internal error: ' + err);
    });
  });
};

const createGame = (ownerKey) => {
  const pin = Security.getRandomString(6);
  games.add({
    pin: pin,
    roundCount: 0,
    ownerKey: ownerKey,
    playerKeys: [ownerKey],
    currentState: 'Waiting for players to join',
  }).then(docRef => {
    return docRef.id;
  });
};

const getRandomQuip = () => {
  return randomQuips.where('id', '>=', '').orderBy('random').limit(1).get().then(snapshot => {
    if (!snapshot.empty) {
      return snapshot.data();
    }
  });
};

module.exports = {
  createUser,
  addUserToGame,
  createGame,
};