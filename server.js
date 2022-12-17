const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const port = 3000;
const fs = require('fs');

const url = require('url');

const WebSocket = require('ws');
const wss = new WebSocket.Server({ noServer: true, clientTracking: true });

const os = require('os');

const { MongoClient } = require("mongodb");
const urlStr =
    'mongodb+srv://UO276077:Bbhk2TG5pUpO848Y@cluster0.vtzwtlq.mongodb.net/?retryWrites=true&w=majority';
//app.set('connectionStrings', urlStr);

//const router = express.Router();
const path = require('path');


//let logsRepository = require("./repositories/logsRepository.js");
//logsRepository.init(app, MongoClient);
//require("./routes/logRouter.js")(app, logsRepository);


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

/*
app.get('/logs', (req, res) => {
  fs.readdir(__dirname + '/Logs', (err, files) => {
    if (err)
    console.log(err);
    else {
      console.log("\nCurrent directory filenames:");
      let fileList = files.filter(file => file.endsWith('.log'));
      let names = fileList.map(file => file.substring(0, file.length - 4));
      
      res.render('logs.twig', {files: names});
    }      
  })
});

app.get('/:date', (req, res) => {
  var date = req.params.date;
  res.sendFile(__dirname + '/Logs/' + date + '.log');
});
*/

// Get all logs
app.get("/logs", async (req, res) => {
  try{
    
    const client = await MongoClient.connect(urlStr);
    /*const db = client.db("vrphotosense");
    const collectionName = 'logs';
    const collection = db.collection(collectionName);
    
    res.render('logs.twig', {files: collection});*/
    res.send('ok');

  } catch (err) {
    throw err;
  }
  /*fs.readdir( path.join(__dirname, 'Logs'), (err, files) => {
    if (err)
    console.log(err);
    else {
      console.log("\nCurrent directory filenames:");
      let fileList = files.filter(file => file.endsWith('.log'));
      let names = fileList.map(file => file.substring(0, file.length - 4));
      
      res.render('logs.twig', {files: names});
    }      
  })*/
});

app.get('/:date', async (req, res) => {
  var date = req.params.date;

  try {
      const { props: log } = await logsCollection.get(date);
      res.send(log);
  } catch (err) {
      console.log(err.message, `Log with date ${date} does not exist`);
      res.sendStatus(404);
  }

  //res.sendFile(__dirname + '/Logs/' + date + '.log');
});


wss.on('connection', function connection(ws, request) {
    let date = new Date();
    console.log(date + ' | A new client is connected.');
    let actualMonth = date.getMonth() + 1;
    //Create the log file path
    var fileName = date.getFullYear().toString()
                  + actualMonth.toString().padStart(2, '0')
                  + date.getDate().toString().padStart(2, '0');
    var fileLog = __dirname + '/Logs/' + fileName + ".log";
    // Handle all messages from users.
    ws.on('message', function(msgStr) {
      console.log('Message: '+ msgStr);
      var date = new Date();
      msgStr = date.getHours().toString().padStart(2, '0')
              + ':' + date.getMinutes().toString().padStart(2, '0')
              + ':' + date.getSeconds().toString().padStart(2, '0') 
              +' | ' + msgStr;
      // Send back the same message.
      ws.send(msgStr);
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(msgStr);
        }
      });
      /*// Write on the log file
      fs.appendFile(fileLog, msgStr + os.EOL, 'utf8', (err) => {
        if (err) throw err;
        console.log("error writing file");
      });*/
    });
    // What to do when client disconnect?
    ws.on('close', function(connection) {
      console.log(new Date() + ' | Closing connection for a client.');
      // One of the clients has disconnected.
    });
});

server.on('upgrade', function upgrade(request, socket, head) {
    console.log(new Date().getDate() + ' | Upgrading http connection to wss: url = '+request.url);
    // Parsing url from the request.
    var parsedUrl = url.parse(request.url, true, true);
    const pathname = parsedUrl.pathname
    console.log(new Date() + ' | Pathname = '+pathname);
    // If path is valid connect to the websocket.
    if (pathname === '/') {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
});


server.listen((process.env.PORT || port), function() {
    console.log(new Date().getDate() + ' | Server is listening on port ' + process.env.PORT);
    // Server is running.
});