

// Process loaded page
function processWiki() {
    if (scpWebsite==null)
        return false;
    injectExtensionScript("scpEventOverrides.js");
    if (checkIfForum())
        processForumPage();
    else {
        processWikiPage();
    }
    overrideUserInfoLinks();
    overrideWikiBottomButtons();
    return true;
}

// Listen to messages from forum page
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.text == "USER_INFO_DIALOG_INTERNAL")
            processUserInfoDialog(message.userName)
        else if (message.text == "HISTORY_MODULE_LOADED_INTERNAL")
            historyModuleLoaded()
        else if (message.text == "ACTION_AREA_UPDATED_INTERNAL") {
            overrideHistoryModuleUpdateRevisionListPageButtons();
            overrideUserInfoLinks();
        }
        else if (message.text == "PAGERATE_MODULE_LOADED_INTERNAL")
            overrideShowVotersButton();
    }
);


/* Subscribing to events */

//document.addEventListener("DOMContentLoaded", runLinkifier, false);
//runLinkifier();

/*

chrome.runtime.onMessage.addListener(domContentRequestMessageHandler);
// On DOM content request message
function domContentRequestMessageHandler(msg, sender, responseHandler) {
    if (msg.text && (msg.text == "msgScpRequestDOMContent")) {                
        //domContentLoadedHandler();
        //responseHandler("");
    }        
}

*/

/*    var jqueryCss = document.createElement("link");
    jqueryCss.rel = "stylesheet";
    jqueryCss.type = "text/css";
    jqueryCss.href = chrome.extension.getURL("jquery-ui/jquery-ui.css");
    document.head.appendChild(jqueryCss);
    
    var dialogDiv = document.createElement("div");
    dialogDiv.id = "scpTestDialog";
    dialogDiv.title = "My test dialog";
    document.body.appendChild(dialogDiv);
    $(dialogDiv).dialog({ autoOpen: false, show: {delay: 500} });
    $(document).tooltip({
        items: "a.scpArticleLink", 
        content: function () {
            makeXMLHttpRequest(this, this.getAttribute("href"), 
                function(sender, responseText){
                    var doc = document.implementation.createHTMLDocument("sad");
                    doc.write(responseText);
                    $("#scpTestDialog").html(doc.getElementById("page-content").innerHTML);
                });
        }
    });
    var scriptElem = document.createElement("script");
    scriptElem.type = "text/javascript";
    
//    scriptElem.innerText = "console.log(typeof jQuery)";    
//    scriptElem.innerText = "function scpInitTestDialog(){$( document ).tooltip();}";    
//    scriptElem.innerText = "function scpInitTestDialog(){$(\"#scpTestDialog\").dialog({ autoOpen: false });}";    
//    scriptElem.innerText = "$(document).ready(function (){$(\"#scpTestDialog\").dialog({ autoOpen: false });});";    
    document.head.appendChild(scriptElem);
*/    
    // console.log(scpWebsite.name);
