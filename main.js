/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function(intentData) {
  chrome.app.window.create('index.html', {
  	id: "mainwin",
    bounds: {
      width: 500,
      height: 640
    }
  });
});
/*chrome.app.runtime.onLaunched.addListener(function() {
  /*var w = chrome.appWindow || chrome.app.window;
  w.create('main.html', {
    frame: 'chrome',
    width: 440,
    minWidth: 440,
    minHeight: 200,
  });*/
  /*window.open('index.html');
});*/
