// Default extensions settings used on first launch or after updated to a newer version
// Have to copy it here from constants.js because service worker have to be a single file
// and it cannot import other scripts unless its declared as type: module which is a whole other problem
var scpperDefaultSettings = {
    useLinkifier: true,
    linkifierTemplate: "smart",
    addAuthorPage: true,
    addArticleName: true,
    addPageInfo: true,
    overrideForum: true,
    linkTooltips: true
};


function makeXMLHttpRequest(sender, url, callback) {
    var request = new Request(url);
    // I truly hate promises
    fetch(request)
        .then((response) => {
            response.text().then((text) => callback({sender: sender, text: text, success: response.status==200}))});    
}

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
        if (request.kind == "XHR") {
            makeXMLHttpRequest(request.sender, request.url, sendResponse);
        }
        return true;
    }
);
