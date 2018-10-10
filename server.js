// import { setInterval } from 'timers';

// Webscocket Part
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
var mouseSocket = null;

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

      var msgObject = JSON.parse(message);
      if (msgObject && msgObject.task)
      {
          switch (msgObject.task)
          {
              case 'mute':
                lgRequest('audio/volumeUp');
              break;
              case 'volumeUp':
                lgRequest('audio/volumeUp');
            break;
                case 'volumeDown':
                lgRequest('audio/volumeDown');
                break;
            case 'listLaunchPoints':
                lgRequest('com.webos.applicationManager/listLaunchPoints');
                break;
            case 'rawCmd':
                lgRequest(msgObject.cmd);
            break;
            case 'launch':
                lgRequest('system.launcher/launch',{id: msgObject.id});
            break;
            case 'click':
                if (mouseSocket)
                {
                    mouseSocket.send('click');
                }
            break;
            case 'button':
                if (mouseSocket)
                {
                    mouseSocket.send('button',{name:msgObject.keyName});
                }
            break;
          }
      }

    }
    
);
ws.on('error', () => console.log('errored'));
  
    // ws.send('something');
  });
wss.on('error', function error(err) {
    console.log('wss Error', err);
});


var lgtv = require("lgtv2")({
    url: 'ws://192.168.178.80:3000'
});
var lgConnected = false; 

lgtv.on('error', function (err) {
    console.log('LG Error',err);
});
lgtv.on('connecting', function (v) {
    lgConnected = false;
    mouseSocket = null;
    wss.broadcast('{"connected":false}')
    console.log('LG Connecting',v);
});
lgtv.on('close', function (v) {
    console.log('LG Close',v);
    mouseSocket = null;
    lgConnected = false;
});

lgtv.on('connect', function () {
    console.log('connected');
    lgConnected = true;
    lgtv.subscribe('ssap://audio/getVolume', function (err, res) {
        if (res.changed.indexOf('volume') !== -1) {
            // console.log('volume changed',JSON.stringify(res));
            wss.broadcast(JSON.stringify(res));
        }
        if (res.changed.indexOf('muted') !== -1) {
            // console.log('mute changed', res);
            wss.broadcast(JSON.stringify(res));
        }
    });
    lgtv.getSocket(
        'ssap://com.webos.service.networkinput/getPointerInputSocket',
        function(err, sock) {
            if (!err) {
                console.log('REsponse GetSocket', sock);
                mouseSocket = sock;
            }
        }
    );
    // lgtv.subscribe('ssap://api/getServiceList', function (err, res) {
    //     wss.broadcast(JSON.stringify(res));
    // });
    // lgtv.subscribe('ssap://com.webos.applicationManager/listLaunchPoints', function (err, res) {
    //     console.log('serviceList',res);
    // });

});

var lgRequest = function(command,payload)
{
    lgtv.request('ssap://'+command, payload, function (err, res) {
                    console.log('Request:',err,res);
                    if (err == null)
                    {
                        wss.broadcast(JSON.stringify(res));
                    }
                });
}

// setInterval(function() {
//     console.log(lgtv);
// }, 1000);
