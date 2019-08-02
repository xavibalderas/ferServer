var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const parser = new Readline()

const port = new SerialPort('/dev/tty.usbmodem14101', {
  baudRate: 115200
})
port.pipe(parser)


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Switches the port into "flowing mode"
parser.on('data', (data) => {
  console.log(data);
  const valores = JSON.parse(data);
  console.log(valores.temperature);
  io.emit('message', valores.temperature);
})


io.on('connection', function(socket){
  console.log('a user connected');

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
