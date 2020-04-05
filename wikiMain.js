

// Process loaded page
function processWiki() {
    if (scpWebsite==null)
        return false;
    injectExtensionScript("constants.js");
    injectExtensionScript("scpEventOverrides.js");
    if (checkIfForum())
        processForumPage();
    else {
        processWikiPage();
        retrievePageInfo();
    }
    overrideUserInfoLinks();
    // overrideWikiBottomButtons();
    return true;
}

// Listen to messages from the page 
document.addEventListener('ScpperExternalMessage', function(event) {
    if (event.detail.text == "USER_INFO_DIALOG_EXTERNAL")
        // chrome.tabs.sendMessage(sender.tab.id, {text: "USER_INFO_DIALOG_INTERNAL", userName: event.detail.userName, userId: event.detail.userId})
		processUserInfoDialog(event.detail.userName, event.detail.userId)
    else if (event.detail.text == "HISTORY_MODULE_LOADED_EXTERNAL")
        // chrome.tabs.sendMessage(sender.tab.id, {text: "HISTORY_MODULE_LOADED_INTERNAL"})        
		historyModuleLoaded()
	else if (event.detail.text == "ACTION_AREA_UPDATED_EXTERNAL") {
        // chrome.tabs.sendMessage(sender.tab.id, {text: "ACTION_AREA_UPDATED_INTERNAL"})
		overrideHistoryModuleUpdateRevisionListPageButtons();
		overrideUserInfoLinks();
	}	
    else if (event.detail.text == "PAGERATE_MODULE_LOADED_EXTERNAL")
        // chrome.tabs.sendMessage(sender.tab.id, {text: "PAGERATE_MODULE_LOADED_INTERNAL"})
		overrideShowVotersButton();
});