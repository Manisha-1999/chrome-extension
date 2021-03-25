function copyToClipboard(text) {
  var copyDiv = document.createElement('div');
  copyDiv.contentEditable = true;
  document.body.appendChild(copyDiv);
  copyDiv.innerHTML = text;
  copyDiv.unselectable = "off";
  copyDiv.focus();
  document.execCommand('SelectAll');
  document.execCommand("Copy", false, null);
  document.body.removeChild(copyDiv);
}
function copyFromClipboard() {
  var copyDiv = document.createElement('div');
  copyDiv.contentEditable = true;
  document.body.appendChild(copyDiv);
  copyDiv.innerHTML = text;
  copyDiv.unselectable = "off";
  copyDiv.focus();
  document.execCommand('SelectAll');
  document.execCommand("Paste", false, null);
  var text = copyDiv.innerHTML;
  document.body.removeChild(copyDiv);
  return text;
}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var action = request.action;
  if (action == "getKeys") {
    sendResponse(localStorage['shortkeys']);
  }
  else if (action == "importSettingsFromClipboard") {
    var keys_str = copyFromClipboard();
    sendResponse(keys_str);
  }
  else if (action == "exportSettingsToClipboard") {
    var keys_str = JSON.stringify(request.keys);
    copyToClipboard(keys_str);
  }
  else if (action == "nexttab") {
    selectTab("next");
  }
  else if (action == "prevtab") {
    selectTab("previous");
  }
  else if (action == "newtab") {
    chrome.tabs.create({});
  }
  else if (action == "closetab") {
    chrome.tabs.getSelected(null, function(tab){
      chrome.tabs.remove(tab.id);
    });
  }
  else if (action == 'gototab') {
    var createNewTab = function() {
      chrome.tabs.create({url: request.openurl});
    }
    if (request.matchurl) {
      chrome.tabs.query({url: request.matchurl, currentWindow: true}, function (tabs) {
        if (tabs.length > 0) {
          chrome.tabs.update(tabs[0].id, {selected: true});
        } else {
          createNewTab();
        }
      });
    } else {
      createNewTab();
    }
  }
  else if (action == 'openbookmark') {
    chrome.bookmarks.search({title: request.bookmark}, function (nodes) {
      var openNode;
      for (var i = nodes.length; i-- > 0;) {
        var node = nodes[i];
        if (node.url && node.title == request.bookmark) {
          openNode = node;
          break;
        }
      }
      chrome.tabs.update(sender.tab.id, {url: unescape(openNode.url)});
    });
  }
  else {
    sendResponse({});
  }
});
function selectTab(direction) {
  chrome.tabs.getAllInWindow(null, function(tabs) {
    if (tabs.length <= 1)
      return;
    chrome.tabs.getSelected(null, function(currentTab) {
      switch (direction) {
        case "next":
          toSelect = tabs[(currentTab.index + 1 + tabs.length) % tabs.length];
          break;
        case "previous":
          toSelect = tabs[(currentTab.index - 1 + tabs.length) % tabs.length];
          break;
        case "first":
          toSelect = tabs[0];
          break;
        case "last":
          toSelect = tabs[tabs.length - 1];
          break;
      }
      chrome.tabs.update(toSelect.id, { selected: true });
    });
  });
}
