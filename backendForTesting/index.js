//const http = require('http');
var express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser');
var app = express();
var socket = require('socket.io');

var hostname = '127.0.0.1';
var port = 8080;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello World!\n');
// });

var servr = app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

/////static fles
app.use(express.static('public'))

// var backendURI = '/backend';
// app.all(backendURI,(req, res, next)=>{ // app.all implies this will be called for any HTTP verb for this specific dishURI.
// res.setHeader('content-type', 'text/html');
// res.statusCode = 200;
// res.end(`coordinats received are lat: ${req.body}   long: ${} `)
//    // next(); //next makes the modified req, res objects available to the other actions that deal with dishURI.
// })

//socket function takes server object
var io = socket(servr);
io.on('connection', function(sock){
 console.log(`connection established at socket id: ${sock.id}`);
 //register the handler for client's usertext event.
 sock.on('usertext', function(data){
   //io.sockets gives all the sockets that are connected to this server. i.e all users.
   //emits the alluserstext event to all the users connected.
   io.sockets.emit('alluserstext', data);
 })

});

//sock.broadcast.emit('eventname', data) will send this event to every user other than the
//one for which the socket is connected to.