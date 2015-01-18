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
		if (needSave)
			chrome.storage.sync.set({"scpperSettings": newSettings});
	});
});

// Listen to messages from forum page
chrome.runtime.onMessageExternal.addListener(
  function(message, sender, sendResponse) {
    if (message.text == "FORUM_POSTS_UPDATED_EXTERNAL")
		chrome.tabs.sendMessage(sender.tab.id, {text: "FORUM_POSTS_UPDATED_INTERNAL"})
	else if (message.text == "USER_INFO_DIALOG_EXTERNAL")
		chrome.tabs.sendMessage(sender.tab.id, {text: "USER_INFO_DIALOG_INTERNAL", userName: message.userName})
	else if (message.text == "HISTORY_MODULE_LOADED_EXTERNAL")
		chrome.tabs.sendMessage(sender.tab.id, {text: "HISTORY_MODULE_LOADED_INTERNAL"})		
	else if (message.text == "ACTION_AREA_UPDATED_EXTERNAL")
		chrome.tabs.sendMessage(sender.tab.id, {text: "ACTION_AREA_UPDATED_INTERNAL"})
	else if (message.text == "PAGERATE_MODULE_LOADED_EXTERNAL")
		chrome.tabs.sendMessage(sender.tab.id, {text: "PAGERATE_MODULE_LOADED_INTERNAL"})
  }
);