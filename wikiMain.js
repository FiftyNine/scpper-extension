

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
    return true;
}

// Listen to messages from the page
document.addEventListener('ScpperExternalMessage', function(event) {
    if (event.detail.text == "USER_INFO_DIALOG_EXTERNAL")
        processUserInfoDialog(event.detail.userName, event.detail.userId)
    else if (event.detail.text == "REQUEST_SCPPER_SETTINGS") {
        var detail = {text: 'RETURN_SCPPER_SETTINGS', settings: scpperSettings};
        sendMessageToPage(detail);
    }
});