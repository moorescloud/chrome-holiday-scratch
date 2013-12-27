var hol = null;

onload = function() {
  var start = document.getElementById("start");
  var stop = document.getElementById("stop");
  //var hosts = document.getElementById("hosts");
  //var hosts = "192.168.0.114"
  var port = 19911
  var directory = document.getElementById("directory");

  var socket = chrome.socket;
  var socketInfo;
  var filesMap = {};

  var stringToUint8Array = function(string) {
    var buffer = new ArrayBuffer(string.length);
    var view = new Uint8Array(buffer);
    for(var i = 0; i < string.length; i++) {
      view[i] = string.charCodeAt(i);
    }
    return view;
  };

  var arrayBufferToString = function(buffer) {
    var str = '';
    var uArrayVal = new Uint8Array(buffer);
    for(var s = 0; s < uArrayVal.length; s++) {
      str += String.fromCharCode(uArrayVal[s]);
    }
    return str;
  };

  var logToScreen = function(log) {
    //logger.textContent += log + "\n";
    console.log(log);
  }

  var writeErrorResponse = function(socketId, errorCode, keepAlive) {
    var file = { size: 0 };
    console.info("writeErrorResponse:: begin... ");
    console.info("writeErrorResponse:: file = " + file);
    var contentType = "text/plain"; //(file.type === "") ? "text/plain" : file.type;
    var contentLength = file.size;
    var header = stringToUint8Array("HTTP/1.0 " + errorCode + " Not Found\nContent-length: " + file.size + "\nContent-type:" + contentType + ( keepAlive ? "\nConnection: keep-alive" : "") + "\n\n");
    console.info("writeErrorResponse:: Done setting header...");
    var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
    var view = new Uint8Array(outputBuffer)
    view.set(header, 0);
    console.info("writeErrorResponse:: Done setting view...");
    socket.write(socketId, outputBuffer, function(writeInfo) {
      console.log("WRITE", writeInfo);
      if (keepAlive) {
        readFromSocket(socketId);
      } else {
        socket.destroy(socketId);
        socket.accept(socketInfo.socketId, onAccept);
      }
    });
    console.info("writeErrorResponse::filereader:: end onload...");

    console.info("writeErrorResponse:: end...");
  };

  /*var write200Response = function(socketId, file, keepAlive) {
    var contentType = (file.type === "") ? "text/plain" : file.type;
    var contentLength = file.size;
    var header = stringToUint8Array("HTTP/1.0 200 OK\nContent-length: " + file.size + "\nContent-type:" + contentType + ( keepAlive ? "\nConnection: keep-alive" : "") + "\n\n");
    var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
    var view = new Uint8Array(outputBuffer)
    view.set(header, 0);

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
       view.set(new Uint8Array(e.target.result), header.byteLength);
       socket.write(socketId, outputBuffer, function(writeInfo) {
         console.log("WRITE", writeInfo);
         if (keepAlive) {
           readFromSocket(socketId);
         } else {
           socket.destroy(socketId);
           socket.accept(socketInfo.socketId, onAccept);
         }
      });
    };

    fileReader.readAsArrayBuffer(file);
  };*/

  var writeScratch200Response = function(socketId, msg) {
    var contentType = "text/plain";
    var response = stringToUint8Array("HTTP/1.0 200 OK\nContent-length: " + msg.length + "\nContent-type: text/plain" + "\n\n" + msg);
    //console.log("writeScratch200Response: ", response);
    var outputBuffer = new ArrayBuffer(response.length);
    var view = new Uint8Array(outputBuffer)
    view.set(response, 0);

    socket.write(socketId, outputBuffer, function(writeInfo) {
       //console.log("WRITE", writeInfo);
       socket.destroy(socketId);
       socket.accept(socketInfo.socketId, onAccept);
    });
  }

  var onAccept = function(acceptInfo) {
    //console.log("ACCEPT", acceptInfo)
    readFromSocket(acceptInfo.socketId);
  };

  var readFromSocket = function(socketId) {
    //  Read in the data
    socket.read(socketId, function(readInfo) {
      //console.log("READ", readInfo);
      // Parse the request.
      var data = arrayBufferToString(readInfo.data);
      //console.log("DATAS: ", data)
      if(data.indexOf("GET ") == 0) {
        var keepAlive = false;
        if (data.indexOf("Connection: keep-alive") != -1) {
          keepAlive = true;
        }

        // ok we're going to be very stupid and parse the first part of the URL
        if (data.indexOf("/poll") != -1) {
          //logToScreen("GET 200 " + "/poll");
          var msg = doPollMsg(data);
          writeScratch200Response(socketId, msg);
        } else if (data.indexOf("/reset_all") != -1) {
          //logToScreen("GET 200 " + "/reset_all");
          var msg = doResetAllMsg();
          writeScratch200Response(socketId, msg);
        } else if (data.indexOf("/setred") != -1) {
          var msg = doSetRed(data);   // Leave it to called routine to extract datas from URL
           writeScratch200Response(socketId, msg);           
        } else if (data.indexOf("/setgreen") != -1) {
          var msg = doSetGreen(data);   // Leave it to called routine to extract datas from URL
           writeScratch200Response(socketId, msg);           
        } else if (data.indexOf("/setblue") != -1) {
          var msg = doSetBlue(data);   // Leave it to called routine to extract datas from URL
           writeScratch200Response(socketId, msg);           
        } else if (data.indexOf("/lightglobe") != -1) {
          var msg = doLightGlobe(data);   // Leave it to called routine to extract datas from URL
           writeScratch200Response(socketId, msg);           
        } else if (data.indexOf("/darkglobe") != -1) {
          var msg = doDarkGlobe(data);   // Leave it to called routine to extract datas from URL
           writeScratch200Response(socketId, msg);           
        } else {
          writeErrorResponse(socketId, 404, false);
        }
      } else {
        // Throw an error
        socket.destroy(socketId);
      }
    });
  };

  function doPollMsg(datas) {
    //var i = datas.split("/")
    //console.log(i);
    return "globe " + sketch_globe.toString() + 
      "\nred " + sketch_red.toString() + 
      "\ngreen " + sketch_green.toString() + 
      "\nblue " + sketch_blue.toString()  + "\n";
  }

  function doResetAllMsg() {

    // Resets all the variables
    sketch_red = 0;
    sketch_green = 0;
    sketch_blue = 0
    sketch_globe = 1;

    // And here we will reset the string to black -- all off.
    //hol.setstring(0x00, 0x00, 0x00);
    //hol.render();
    return "";
  }

  function doLightGlobe(datas) {
    var retval = "";
    var sp = datas.split(" ");    // Split by spaces
    var url = sp[1].split("/");      // Then split up the URL, this should be good
    //console.log("lighting globe:", url[2].toString());
    var rv  = parseInt(url[2]);
    if ((rv < 1) || (rv > 50)) {
      return retval;
    } else {
      sketch_globe = rv;
    }

    // Let's light the globe here
    hol.setglobe(sketch_globe - 1, sketch_red, sketch_green, sketch_blue);
    hol.render();
    return retval;
  }

  function doDarkGlobe(datas) {
    var retval = "";
    var sp = datas.split(" ");    // Split by spaces
    var url = sp[1].split("/");      // Then split up the URL, this should be good
    //console.log("endarkening globe:", url[2].toString());
    var rv  = parseInt(url[2]);
    if ((rv < 1) || (rv > 50)) {
      return retval;
    } else {
      sketch_globe = rv;
    }

    // When holiday integrated we'll turn off the globe here
    hol.setglobe(sketch_globe -1, 0x00, 0x00, 0x00);
    hol.render();
    return retval;
  }

  function doSetRed(datas) {
    var retval = "";
    var sp = datas.split(" ");    // Split by spaces
    var url = sp[1].split("/");      // Then split up the URL, this should be good
    //console.log("red value:", url[2].toString());
    var rv  = parseInt(url[2]);
    if ((rv < 0) || (rv > 255)) {
      return retval;
    } else {
      sketch_red = rv;
    }
    return retval;
  }

  function doSetGreen(datas) {
    var retval = "";
    var sp = datas.split(" ");    // Split by spaces
    var url = sp[1].split("/");      // Then split up the URL, this should be good
    //console.log("green value:", url[2].toString());
    var rv  = parseInt(url[2]);
    if ((rv < 0) || (rv > 255)) {
      return retval;
    } else {
      sketch_green = rv;
    }
    return retval;
  }

  function doSetBlue(datas) {
    var retval = "";
    var sp = datas.split(" ");    // Split by spaces
    var url = sp[1].split("/");      // Then split up the URL, this should be good
    //console.log("blue value:", url[2]);
    var rv  = parseInt(url[2]);
    if ((rv < 0) || (rv > 255)) {
      return retval;
    } else {
      sketch_blue = rv;
    }
    return retval;
  }

  /*directory.onchange = function(e) {
    if (socketInfo) socket.destroy(socketInfo.socketId);

    var files = e.target.files;

    for(var i = 0; i < files.length; i++) {
      //remove the first first directory
      var path = files[i].webkitRelativePath;
      if (path && path.indexOf("/")>=0) {
       filesMap[path.substr(path.indexOf("/"))] = files[i];
      } else {
       filesMap["/"+files[i].fileName] = files[i];
      }
    }

    start.disabled = false;
    stop.disabled = true;
    directory.disabled = true;
  };*/

  /*start.onclick = function() {
    socket.create("tcp", {}, function(_socketInfo) {
      socketInfo = _socketInfo;
      socket.listen(socketInfo.socketId, hosts.value, parseInt(port.value), 50, function(result) {
        console.log("LISTENING:", result);
        socket.accept(socketInfo.socketId, onAccept);
      });
    });

    //directory.disabled = true;
    stop.disabled = false;
    start.disabled = true;
  };

  stop.onclick = function() {
    //directory.disabled = false;
    stop.disabled = true;
    start.disabled = false;
    socket.destroy(socketInfo.socketId);
  };

  socket.getNetworkList(function(interfaces) {
    for(var i in interfaces) {
      var interface = interfaces[i];
      var opt = document.createElement("option");
      opt.value = interface.address;
      opt.innerText = interface.name + " - " + interface.address;
      hosts.appendChild(opt);
    }
  });*/

  // And here's the stuff we do.

  var sketch_globe = 1;
  var sketch_red = 0;
  var sketch_green = 0;
  var sketch_blue = 0;

  // Set up the listener socket thingy to listen to the localhost port
  // Since that's where Scratch will be sending its requests to.
  socket.create("tcp", {}, function(_socketInfo) {
    socketInfo = _socketInfo;
    socket.listen(socketInfo.socketId, "127.0.0.1", port, 50, function(result) {
      console.log("LISTENING:", result);
      socket.accept(socketInfo.socketId, onAccept);
    });
  });

  // Bind a selector change thingy
  $("#selector").change(function() {
    console.log("changed to: ", $("#selector").val());
    if (hol != null) {
      console.log("Changing holidays");
      hol.closeSocket();
      hol = new Holiday($("#selector").val());
    }
  });

};



