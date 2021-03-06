function OptionsCtrl($scope) {
  $scope.keys = [];
  $scope.chromesync = false;
  var addBlankIfEmpty = function () {
    if ($scope.keys.length == 0) {
      $scope.addEmpty();
    }
  };
  $scope.addEmpty = function () {
    $scope.keys.push({
      key: '',
      action: 'top',
    });
  };
  $scope.isEmpty = function (element, index, array) {
    return element && element.key != "";
  };
  $scope.deleteKey = function (index) {
    $scope.keys.splice(index, 1);
  };
  $scope.saveKeys = function () {
    $scope.keys = $scope.keys.filter($scope.isEmpty); 
    for (i = 0; i < $scope.keys.length; i++) {
      if (typeof $scope.keys[i].sites === 'string') {
        $scope.keys[i].sitesArray = $scope.keys[i].sites.split("\n");
      } else {
        $scope.keys[i].sitesArray = $scope.keys[i].sites;
      }
    }
    var settings = {keys: $scope.keys, chromesync: $scope.chromesync}
    if ($scope.chromesync) {
      chrome.storage.sync.set(settings, function () {
        $('.chromesyncsuccess').slideDown('fast');
        setTimeout(function () {
          $('.chromesyncsuccess').slideUp('fast');
        }, 3000);
      });
    }
    localStorage["shortkeys"] = JSON.stringify(settings);
  $('.settingssaved').slideDown('fast');
    setTimeout(function () {
      $('.settingssaved').slideUp('fast');
    }, 5000);
    addBlankIfEmpty();
    window.scroll(0, 0);
  };
  $scope.mergeInKeys = function (newKeys, noReplace) {
    var keyIndexMap = {};
    for (var i = 0; i < $scope.keys.length; i++) {
      var key = $scope.keys[i];
      keyIndexMap[key.key] = i;
    }
    for (var i = 0; i < newKeys.length; i++) {
      var newKey = newKeys[i];
      var index = keyIndexMap[newKey.key];
      if (index === undefined) {
        $scope.keys.push(newKey);
      } else {
        if (!noReplace) {
          $scope.keys[index] = newKey;
        }
      }
    }
  };
  $scope.settingsStr = localStorage["shortkeys"];
  if ($scope.settingsStr) {
    var settings = JSON.parse($scope.settingsStr);
    if (settings.keys != undefined) {
      $scope.keys = settings.keys || [];
    } else {
      $scope.keys = settings || [];  
    }
    $scope.chromesync = settings.chromesync || false;
  }
  if ($scope.chromesync) {
    chrome.storage.sync.get(null, function (response) {
      if (!response) {
        $('.chromesyncfailure').slideDown('fast');
        setTimeout(function () {
          $('.chromesyncfailure').slideUp('fast');
        }, 3000);
      } else {
        $scope.$apply(function () {
          $scope.mergeInKeys(response.keys);
          addBlankIfEmpty();
        });
      }
    });
  } else {
    addBlankIfEmpty();
  }
}