#!/usr/bin/env node

var app = require('../app');

var debug = require('debug')('back-end:server');
var http = require('http');

var port = normalizePort(process.env.PORT || '8888');
app.set('port', port);

var server = http.createServer(app);
const datastore = require('../db/datastore');

var io = require('socket.io')(server);

io.on('connection', socket => {
  console.log('new socket connection established');

  // name, pin
  socket.on('join game', data => {
    if (data['name'] && data['pin']) {
      console.log('joining game');
      datastore.createUser(data['name']).then(playerKey => {
        datastore.addUserToGame(playerKey, data['pin']).then(joinedGame => {
          console.log('successfully joined game with key ' + joinedGame['key']);
          socket.join(joinedGame['key']);
          socket.emit('playerKey', playerKey);
          io.in(gameKey).emit('new player', data['name']);
        }).catch(err => {
          console.error('Error creating user: ' + err);
        });
      });
    } else {
      socket.emit('dammit kirpal');
    }
  });

  // name
  socket.on('create game', data => {
    if (data['name']) {
      console.log('creating game');
      datastore.createUser(data['name']).then(playerKey => {
        console.log('successfully created user! ' + playerKey);
        datastore.createGame(playerKey).then((newGame) => {
          console.log('successfully created game ' + JSON.stringify(newGame));
          socket.join(newGame['key']);
          socket.emit('new player', playerKey);
          socket.emit('new game', newGame['key']);
        }).catch(err => {
          console.error('Error creating user: ' + err);
        });
      });
    } else {
      socket.emit('dammit kirpal');
    }
  });

  // gameKey, playerKey
  socket.on('start game', data => {
    if (data['gameKey'] && data['playerKey']) {
      console.log('starting game');
      const gameData = datastore.getGame(data['gameKey']);
      if (gameData['ownerKey'] === data['playerKey']) {
        startGame(gameData);
      } else {
        console.log('tried to start game without being owner of the game');
      }
    } else {
      socket.emit('dammit kirpal');
    }
  });
});

const startGame = (gameData) => {
  const gameKey = gameData['gameKey'];
  const picture = datastore.getRandomPicture();

  datastore.startGame(gameKey, picture['id']).then(() => {
    const startGameState = {
      pictureUrl: picture['img_url'],
    };

    io.in(gameKey).emit('start game', startGameState);
    console.log('started game ' + gameKey);
  });
};

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
