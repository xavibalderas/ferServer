var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const program = require('commander');


const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const parser = new Readline()


program
  .option('-p, --port', 'port for the server', 3000)
  .option('-s, --serial-port <port>', 'serial port to connect to', '/dev/tty.usbmodem14101' );

program.parse(process.argv);

const port = new SerialPort(program.serialPort, {
  baudRate: 115200
},(error)=>{console.log(error)});


port.pipe(parser)


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Switches the port into "flowing mode"
parser.on('data', (data) => {
  console.log(data);
  var valores = {};
  try {
     valores = JSON.parse(data);
  } catch (e) {
     valores = {"temperature": -1};
     console.log(data);
  }
  console.log(valores.temperature);
  io.emit('message', 'Temperature' + valores.temperature);
})


io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('message', 'welcome to the system!!');
  socket.on('led',(data)=>{
      console.log(data);
      if (data === true){
        var z = port.write('on', function(err) {
          if (err) {
            return console.log('Error on write: ', err.message)
          }
          console.log('message written')

        });
        console.log(z);
      }else{
        port.write('off', function(err) {
          if (err) {
            return console.log('Error on write: ', err.message)
          }
          console.log('message written')
        });
      }
  });
});

http.listen(program.port, function(){
  console.log('listening on *:3000');
});
