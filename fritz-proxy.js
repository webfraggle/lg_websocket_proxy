// import { setInterval } from 'timers';

// Webscocket Part
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8088 });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  wss.on('connection', function connection(ws) {
    
    // send volume update
    lgRequest('audio/getVolume');
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);

      

    }
    
);
ws.on('error', () => console.log('errored'));
  
    // ws.send('something');
  });
wss.on('error', function error(err) {
    console.log('wss Error', err);
});


var tr = require("tr-064");
var tr064 = new tr.TR064();
var om;
tr064.initTR064Device("fritz.box", 49000, function (err, device) {
    console.log(err);
    if (!err) {
        device.startEncryptedCommunication(function (err, sslDev) {
            console.log(err);
            if (!err) {
                sslDev.login("blablubb1");
                var wanip = sslDev.services["urn:dslforum-org:service:WANCommonInterfaceConfig:1"];
                //console.log(wanip.actions);
                om = wanip.actions['X_AVM-DE_GetOnlineMonitor'];
                
            }
        });
    }
});

setInterval(function() {
    console.log(om);
    if (!om) return;
    om({'NewSyncGroupIndex':0},function (err, result) {
        console.log(result);
    });
}, 3000);
