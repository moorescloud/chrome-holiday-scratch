/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  /*var w = chrome.appWindow || chrome.app.window;
  w.create('main.html', {
    frame: 'chrome',
    width: 440,
    minWidth: 440,
    minHeight: 200,
  });*/
  window.open('index.html');
});
