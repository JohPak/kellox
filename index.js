const express = require('express');
const app = express();
var expressWs = require('express-ws')(app);
const port = 8080;
const path = require('path');
const moment = require('moment')


// SERVE STATIC FILES Now, you can load the files that are in the public directory
app.use(express.static(__dirname)); //NODEN käynnistyssijainti - saattaa muuttua jos appin siirtää jonnekin

// kaks punaista, yks keltainen ja yks vihreä
// toiseen pelkkää punaista (3-6sek) ja vihreä


var openWebsocketConnections = [];
app.ws('/ws', function(ws, req) {
   // console.log(ws);
    openWebsocketConnections.push(ws);
    ws.on("close", (e)=>{
        var index = openWebsocketConnections.indexOf(ws);
        openWebsocketConnections.splice(index, 1);
    });

  });

app.get("/", (req, res) => {
    res.status(200);
    res.send(`
        <html>
            <body id="tausta">
                <script>
                    var currentLocation = window.location.href;
                    currentLocation = currentLocation.replace("http://", "ws://");
                    currentLocation = currentLocation.replace("https://", "wss://");
                    currentLocation = currentLocation + "ws";

                    var ws = new WebSocket(currentLocation);
                    ws.onopen = function(){
                        console.log("Yhristetty!");
                    }
                    ws.onmessage = function(message){
                        console.log(message.data);
                    }
                </script>
            </body>
        </html>
    `);
});

var counter = 4;
setInterval(() => {
    counter--;
    var color = null;
    if(counter == 3) {
        color = "red";
        // document.getElementById("tausta").style.backgroundColor="red";
    }
    else if(counter == 2)
        color = "red2";
    else if(counter == 1)
        color = "yellow";
    else
        color = "green";

    openWebsocketConnections.forEach(connection => connection.send(color));
    if(counter <= 0)
        counter = 4;
}, 2000);

app.listen(process.env.PORT || port, () => { //Herokua varten. Heroku asettaa portin process.env.PORT:iin
    console.log(`Kellox app listening at http://localhost:${port}`)
    console.log(process.env.PORT ? `Herokun antama portti ${process.env.PORT}` : ``);
  })