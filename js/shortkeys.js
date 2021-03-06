function globToRegex(glob) {
  var specialChars = "\\^$*+?.()|{}[]";
  var regexChars = ["^"];
  for (var i = 0; i < glob.length; ++i) {
    var c = glob.charAt(i);
    if (c == '*') {
      regexChars.push(".*");
    } else {
      if (specialChars.indexOf(c) >= 0) {
        regexChars.push("\\");
      }
      regexChars.push(c);
    }
  }
  regexChars.push("$");
  return new RegExp(regexChars.join(""));
}
chrome.runtime.sendMessage({action: "getKeys"}, function(response) {
  var url = document.URL;
  if (response) {
    var settings = JSON.parse(response);
    var keys = settings.keys;
    if (keys.length > 0) {
      for (var i = 0; i < keys.length; i++) {
        activateKey(keys[i]);
      }
    }
  }
  function activateKey(keyobj) {
    if (keyobj.blacklist && keyobj.sitesArray && keyobj.blacklist != "false") {
      if (keyobj.blacklist == "whitelist") {
        var kill = true;
      }
      for (var j = 0; j < keyobj.sitesArray.length; j++) {
        isMatch = url.match(globToRegex(keyobj.sitesArray[j]))
        if (keyobj.blacklist == "true" && isMatch) {
          return;
        } else if (keyobj.blacklist == "whitelist" && isMatch) {
          kill = false;
        }
      }
      if (kill) {
        return;
      }
    }
    var action = function() {
      doAction(keyobj);
      return false;
    };
    var _oldStopCallback = Mousetrap.stopCallback;
    Mousetrap.stopCallback = function(e, element, combo) {
      if (element.classList.contains('mousetrap')) {
        return true;
      }
      return _oldStopCallback(e, element, combo);
    };
    Mousetrap.bind(keyobj.key, action);
  }
  function doAction(keyobj) {
    var action = keyobj.action;
    var message = {}; 
    if (action == 'copyurl') {
      message.text = document.URL;
    }
     else if (action == "scrollup") {
      window.scrollBy(0,-50);
    } else if (action == "scrollupmore") {
      window.scrollBy(0,-500);
    } else if (action == "scrolldown") {
      window.scrollBy(0,50);
    } else if (action == "scrolldownmore") {
      window.scrollBy(0,500);
    } else if (action == 'back') {
      history.back();
    } else if (action == 'forward') {
      history.forward();
    } else if (action == 'reload') {
      window.location.reload();
    } else if (action == 'zoomin') {
      var curZoom = document.body.style.zoom || 1;
      document.body.style.zoom = (parseFloat(curZoom) + 0.1).toFixed(1);
    } else if (action == 'zoomout') {
      var curZoom = document.body.style.zoom || 1;
      document.body.style.zoom = (parseFloat(curZoom) - 0.1).toFixed(1);
    } else if (action == 'zoomreset') {
      document.body.style.zoom = 1;
    } else if (action == 'javascript') {
      var script = document.createElement('script');
      script.textContent = keyobj.code.replace(/^\s*javascript:/, '');
      document.body.appendChild(script);
      document.body.removeChild(script);
    } else {
      for (var attribute in keyobj) {
        message[attribute] = keyobj[attribute];
      }
      chrome.runtime.sendMessage(message);
    }
  }
});
