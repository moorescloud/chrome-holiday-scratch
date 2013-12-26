/* Do some fun stuff with Javascript via UDP */
var sktId = null;

// Constructor method for the holiday using SecretAPI
// Requires a string 'address' (i.e. IP address 192.168.0.20) or resolvable name (i.e. 'light.local')
//
function Holiday(address) {
  this.address = address;
  console.log("Address set to ", this.address)
  
  this.NUM_GLOBES = 50;
  this.FRAME_SIZE = 160;      // Secret API rame size
  this.FRAME_IGNORE = 10;     // Ignore the first 10 bytes of frame

  this.closeSocket = closeSocket;
  this.setglobe = setglobe;
  this.setstring = setstring;
  this.getglobe = getglobe;
  this.chase = chase;
  this.render = render;

  var globes = new Uint8Array(160);
  this.globes = globes;
  console.log('Array created');

  // Fill the header of the array with zeroes
  for (i=0; i < this.FRAME_IGNORE; i++) {
    this.globes[i] = 0x00;
  }

  // Create the socket we'll use to communicate with the Holiday
  chrome.socket.create('udp', {},
   function(socketInfo) {           // Callback when creation is complete
      // The socket is created, now we want to connect to the service
      sktId = socketInfo.socketId;
      console.log('socket created ', sktId);
    }
  );

  function closeSocket() {
    // Clean up after ourselves;
    chrome.socket.destroy(sktId);
    console.log("Socket destroyed");
  }

  function setglobe(globenum, r, g, b) {
    //console.log("Holiday.setglobe ", r, g, b);
    // Sets a globe's color
    if ((globenum < 0) || (globenum >= this.NUM_GLOBES)) {
      return;
    }

    baseptr = this.FRAME_IGNORE + 3*globenum;
    globes[baseptr] = r;
    globes[baseptr+1] = g;
    globes[baseptr+2] = b; 

    return;
  }

  function setstring(r, g, b) {
    // Sets the whole string to the same color very quickly.
    baseptr = this.FRAME_IGNORE;
    for (j = 0; j < this.NUM_GLOBES; j++) {
      globes[baseptr] = r;
      baseptr +=1
      globes[baseptr] = g;
      baseptr +=1
      globes[baseptr] = b;
      baseptr +=1
    }
    return;
  }

  function chase(r, g, b) {
    // Move all the globes up one position
    // Set the first globe to the passed RGB
    baseptr = this.FRAME_IGNORE;
    for (j = 0; j < (this.NUM_GLOBES-1); j++) {   // Move up
      globes[baseptr+3] = globes[baseptr];        // move R
      baseptr += 1;
      globes[baseptr+3] = globes[baseptr];        // Move G
      baseptr += 1;     
      globes[baseptr+3] = globes[baseptr];        // Move B
      baseptr += 1;  
    }
    this.setglobe(0, r, g, b);                    // Add bottom
  }

  function getglobe() {
    // Sets a globe's color
    if ((globenum < 0) || (globenum >= this.NUM_GLOBES)) {
      return;
    }

    baseptr = this.FRAME_IGNORE + 3*globenum;
    r = globes[baseptr];
    g = globes[baseptr+1];
    b = globes[baseptr+2];
    return [r,g,b];
  }


  function render() {
    //console.log("Holiday.render on ", sktId);
    //var locaddr = this.address;
    var glbs = this.globes;
    if (sktId == null) {
      console.log("No socket abort render");
      return;
    }

    // Connect via the socket
    chrome.socket.connect(sktId, this.address, 9988, function(result) {

       // We are now connected to the socket so send it some data
      chrome.socket.write(sktId, glbs.buffer,
       function(sendInfo) {
         //console.log("wrote " + sendInfo.bytesWritten);
         return;
      });
    });
    return;
  }
}
