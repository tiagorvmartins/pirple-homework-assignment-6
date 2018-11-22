/*
* Primary file for the API
*
*
*/

  // Dependencies
  var http = require('http');
  var https = require('https');
  var url = require('url');
  var StringDecoder = require('string_decoder').StringDecoder;
  var config = require('./config');
  var fs = require('fs');
  var cluster = require('cluster');
  var os = require('os');

  //We are instantiate the HTTP server
  var httpServer = http.createServer(function (req, res){
       unifiedServer(req,res);
  });

  // Instantiate the HTTPS createServer
  var httpsServerOptions = {
       'key': fs.readFileSync('./https/key.pem'),
       'cert': fs.readFileSync('./https/cert.pem')
  };

  // Defining the HTTPS Server
  var httpsServer = https.createServer(httpsServerOptions, function (req, res){
       unifiedServer(req,res);
  });



  // All the server logic for both the http and https server
  var unifiedServer = function(req, res){
    // Get the url and parse it
    var parsedUrl = url.parse(req.url,true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP Method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the notFound handler.
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
          'trimmedPath' : trimmedPath,
          'queryStringObject' : queryStringObject,
          'method': method,
          'headers': headers,
          'payload': buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
          // Use the status code called back by the handler , or default to 200
          statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

          // Use the payload called back by the handler, or default to an empty object
          payload = typeof(payload) == 'object' ? payload : {};

          // Convert the payload to a string
          var payloadString = JSON.stringify(payload);

          // Return the response
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(statusCode);
          res.end(payloadString);

          // Log the statusCode and response
          console.log("--------------------------------- RESPONSE ---------------------------------");
          console.log('\x1b[33m%s\x1b[0m', 'Returned status code: ', statusCode);
          console.log('\x1b[33m%s\x1b[0m', 'Executed by process PID: ', process.pid);
          console.dir(JSON.parse(payloadString), {'colors': true});
          console.log("------------------------------- END RESPONSE -------------------------------");
        });
    });
  };

  // Define the handlers
  var handlers = {};

  // Sample handlers
  handlers.hello = function(data, callback){
    // Callback a http status code, and a payload object
    callback(200,
          {
            'WelcomeMessage':'Hello you successfuly reached my \'hello\' endpoint. Have a nice day, thank you.',
            'StatusCode': '200',
            'YourRequestData': data
          }
    );
  };

  // Not found handler
  handlers.notFound = function(data, callback){
    callback(404,
          {
            'WelcomeMessage': 'The endpoint that you requested is not defined nor available. Have a nice day, thank you.',
            'StatusCode': '404',
            'YourRequestData': data
          });
  };

  // Define the only route handler available
  var router = {
    'hello': handlers.hello
  }

  var init = function(){

    if(cluster.isMaster){
      // Calculate the amount of cores to use
      var amountOfCoresToUse = typeof(config.serverListenCpuCoresAmount) == 'number' && config.serverListenCpuCoresAmount > 0 ? config.serverListenCpuCoresAmount : os.cpus().length;
      if(amountOfCoresToUse > os.cpus().length){
        amountOfCoresToUse = os.cpus().length;
        console.log('\x1b[31m%s\x1b[0m', 'The amount of cores to use specified in config file is larger than the current number of cores in this CPU, variable will be updated with the maximum amount ('+amountOfCoresToUse+').');
      }


      // Send message to user annoucing that all cores will be used
      console.log('\x1b[33m%s\x1b[0m', 'Preparing to launch the http and https server in ' + amountOfCoresToUse + ' CPU cores.');
      for(var i = 0; i < amountOfCoresToUse; i++){
        cluster.fork();
      }
      console.log(process.pid);

    } else {
      var processId = process.pid;

      console.log('\x1b[35m%s\x1b[0m', "A new CPU core is starting just now with PID: " + processId);

      var promisesToLaunch = [];
      promisesToLaunch.push(new Promise(function(resolve, reject){
        try {
          // Start the HTTP server, and have it listen on port 3000
          httpServer.listen(config.httpPort, function(){
           //console.log('\x1b[32m%s\x1b[0m', );
           var text = "The server ["+config.envName+"] is listening on port "+config.httpPort + " now with PID ("+processId+")";
           resolve(text);
          });
        } catch(e){
          resolve(false);
          console.log('\x1b[31m%s\x1b[0m', "There was an error launching the http server on port " + config.httpPort + " with PID: " + processId);
        }
      }));

      promisesToLaunch.push(new Promise(function(resolve, reject){
        try {
          // Start the HTTPS server
          httpsServer.listen(config.httpsPort, function(){
            //console.log('\x1b[32m%s\x1b[0m', );
            var text = "The server ["+config.envName+"] is listening on port "+config.httpsPort + " now with PID ("+processId+")";
            resolve(text);
          });
        } catch(e){
          resolve(false);
          console.log('\x1b[31m%s\x1b[0m', "There was an error launching the https server on port " + config.httpsPort + " with PID: " + processId);
        }
      }));

      Promise.all(promisesToLaunch).then(function(values){
        if(values.every(function(item){
          return item != false;
        })){
          var textToOutput = '';
          textToOutput += 'Process ID (' + processId + ') have been launched with success.\n\n';


          values.forEach(function(elementText){
            if(elementText != false){
              textToOutput += elementText + '\n';
            }
          });

          console.log('\x1b[32m%s\x1b[0m', textToOutput);

        }
      });
    }
  };

  if(require.main === module){
    init();
  }
