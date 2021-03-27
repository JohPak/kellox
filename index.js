const express = require('express');
const app = express();
var expressWs = require('express-ws')(app);
const port = 8080;
const path = require('path');


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
        <head>
        <link rel="icon" type="image/png" href="/img/favicon.png"/>
        <style>
        h1 {
            color:white;
            font-family:helvetica;
            text-align: center;
            font-size: 10em;
        }
        </style>
        </head>
            <body id="tausta" style="background: url(/img/kellox.png) no-repeat; background-size: 80px; background-attachment: fixed; background-position: 10px 10px; background-color:black;">
            <div style="height:100vh; width:100vw;" id="valot"><center><img src="/img/1.png" id="valokuva"></center></div>
                <script>
                    var currentLocation = window.location.href;
                    currentLocation = currentLocation.replace("http://", "ws://");
                    currentLocation = currentLocation.replace("https://", "wss://");
                    currentLocation = currentLocation + "ws";

                    var ws = new WebSocket(currentLocation);
                    ws.onopen = function(){
                        console.log("Yhristetty!");
                    }
                    ws.onmessage = function(s){
                        console.log(s.data);
                        // document.getElementById("tausta").style.backgroundColor=s.data;
                        document.getElementById("valokuva").src=s.data;
                        
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
        color = "/img/1.png";
    }
    else if(counter == 2)
        color = "/img/2.png";
    else if(counter == 1) {
        color = "/img/3.png";
        //arvotaan laskuriin +1, jotta vihreä tulee epätasaisemmin ajoin
        var random_boolean = Math.random() < 0.4; // 40% mahis tulla true
        if (random_boolean) {
            counter++;
        }
    }
    else
        color = "/img/4.png";

    openWebsocketConnections.forEach(connection => connection.send(color));
    if(counter <= 0)
        counter = 4;
}, 1300);

app.listen(process.env.PORT || port, () => { //Herokua varten. Heroku asettaa portin process.env.PORT:iin
    console.log(`Kellox app listening at http://localhost:${port}`)
    console.log(process.env.PORT ? `Herokun antama portti ${process.env.PORT}` : ``);
  })