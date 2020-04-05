// Setup default settings when first installed
chrome.runtime.onInstalled.addListener(function (details) {
    chrome.storage.sync.get("scpperSettings", function(value) {
        var newSettings = value.scpperSettings;
        if (!newSettings)
            newSettings = {};
        var keys = Object.keys(scpperDefaultSettings);
        var needSave = false;
        for (var i=0; i<keys.length; i++)
            if (!newSettings.hasOwnProperty(keys[i])) {
                needSave = true;
                newSettings[keys[i]] = scpperDefaultSettings[keys[i]];
            }
        // Most people kept using default settings after installation and default changed to "smart" after it was introduced
        if (details.reason == "update") {
            if ((details.previousVersion < "0.1.1") && (newSettings.linkifierTemplate == "lax")) {
                newSettings.linkifierTemplate = "smart";
                needSave = true;
            }
            chrome.storage.local.clear();
        }
        if (needSave)
			chrome.storage.sync.set({"scpperSettings": newSettings});
    });
});

// As of Chrome 73 CORS from content scripts is prohibited, 
// and the suggested solution is to pass between CS and background page
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.contentScriptQuery == "pageInfo") {
        var url = "http://scpper.com/extension-page-info?pageId=" +
            encodeURIComponent(request.pageId);
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status==200)
                sendResponse(request.responseText); 
        };
        request.open("GET", url, true);
        request.send();
        return true;  // Will respond asynchronously.
    }
  });
