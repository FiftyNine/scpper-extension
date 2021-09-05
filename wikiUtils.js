var scpTemplate, scpSearchTemplate;


// Add linked SCP from an <a> elem
function scpAddLinkedNumber(node, linkedNumbers) {
    if (node.nodeName.toUpperCase()=="A") 
        for (var i=scpWebsite.articleTemplates.length-1; i>=0; i--) {        
            var template = scpWebsite.articleTemplates[i];
            var ref = new RegExp(template.urlTemplate.replace("@", template.numberRegEx)+"$", "i").exec(node.getAttribute("href"));
            if (ref != null) {
                var num = new RegExp(template.numberRegEx, "i").exec(ref[0]);
                if (num != null)
                    linkedNumbers[num[0].toUpperCase()] = 1;
            }
    }
}    

// Process a text node and convert matching text into SCP links
function scpLinkifyTextNode(node, linkedNumbers, template, strict) {
    if (!scpperSettings.useLinkifier)
        return;
    var scpSearchTemplate;
    if (strict)         
        scpSearchTemplate = template.strictRegEx
    else
        scpSearchTemplate = template.laxRegEx;
    var trimmedScpRegEx = new RegExp(scpSearchTemplate, "igm");                
    scpSearchTemplate = "([\\W_]|\\b)"+scpSearchTemplate+"([\\W_]|\\b)";
    var parent = node.parentElement;    
    if (!node.nodeValue || (parent == null))
        return;
    var scpRegEx = new RegExp(scpSearchTemplate, "igm");        
    var oldText = node.nodeValue;
    var found = false;
    var scpMatch, trimmedMatch;
    var prevPos = 0;    
    var tmp = 0;            
    while ((scpMatch = scpRegEx.exec(oldText)) != null) {
        found = true;        
        var scpNumberRegEx = new RegExp(template.numberRegEx, "igm");
        var scpNumber = scpNumberRegEx.exec(scpMatch[0]);
        // General check
        if ((scpNumber != null) && (!linkedNumbers[scpNumber[0].toUpperCase()])) {
                // Separate check for main list SCPs
                if ((template.kind == "MAIN") && (Number(scpNumber[0]) > MAX_SCP_NUMBER))
                    continue;        
                trimmedScpRegEx.lastIndex = scpRegEx.lastIndex-scpMatch[0].length;
                trimmedMatch = trimmedScpRegEx.exec(oldText);
                var text = oldText.substring(prevPos, trimmedScpRegEx.lastIndex-trimmedMatch[0].length);
                var textNode = document.createTextNode(text);
                parent.insertBefore(textNode, node);
                var scpLink = document.createElement('a');
                var scpLinkText = document.createTextNode(trimmedMatch[0]);
                scpLink.setAttribute("href", template.urlTemplate.replace("@", scpNumber[0]));
                scpLink.appendChild(scpLinkText);
                parent.insertBefore(scpLink, node);
                scpAddLinkedNumber(scpLink, linkedNumbers);
                prevPos = trimmedScpRegEx.lastIndex;
            }
    }
    if (found) {
        var textNode = document.createTextNode(oldText.substring(prevPos, oldText.length));
        parent.insertBefore(textNode, node);
        parent.removeChild(node);
    }
}

// Parse document and get member page link
function getUserMemberPageLinkFromDoc(doc, userName) {
    var links = doc.querySelectorAll("#page-content table.wiki-content-table a");
    var userRegEx = new RegExp("https?://www\\.wikidot\\.com/user:info/"+userName+"$");
    for (var i=0; i<links.length; i++)
        if (userRegEx.test(links[i].getAttribute("href"))) {
            var j=i+1;
            while (j<links.length && userRegEx.test(links[j].getAttribute("href")))
                j++;
            if (j<links.length) {
                memberPage = {link: links[j].getAttribute("href"), text: links[j].innerText};
                return memberPage;
            }
            break;
        }
}

// Try and find the member page for a specified user
function getUserMemberPageLink(userName, callback) {
    if (!scpWebsite || !scpWebsite.membersPages)
        return;
    for (var i=0; i<scpWebsite.membersPages.length; i++)
        makeXMLHttpRequest(null, scpWebsite.primaryLink+scpWebsite.membersPages[i], function(sender, response, success) {
            if (success) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(response, "text/html");
                var memberPage = getUserMemberPageLinkFromDoc(doc, userName);
                if (memberPage)
                    callback(memberPage);
            }
        });
}

// Process user info dialog and add link to the correspondent member page
function processUserInfoDialog(userName, userId) {
    var dialogElem = document.getElementById("odialog-container");    
    if (!dialogElem || (dialogElem.childNodes.length == 0))
        return;
    var tableElem = dialogElem.querySelector("div.content.modal-body table");
    if (!tableElem)
        return;
    // Add Scpper profile
    var linkElem = document.createElement("a");
    linkElem.innerText = userName;
    linkElem.setAttribute("href", "http://scpper.com/user/"+userId);
    var row = tableElem.insertRow(-1);
    var head = row.insertCell(0);
    head.innerHTML = "<b>Scpper profile</b>";
    var body = row.insertCell(1);
    body.appendChild(linkElem);        
    if (!scpperSettings.addAuthorPage)
        return;
    getUserMemberPageLink(userName, function(memberPage) {        
        if (!memberPage)
            return;
        var linkElem = document.createElement("a");
        linkElem.innerText = memberPage.text;
        linkElem.setAttribute("href", memberPage.link);
        var row = tableElem.insertRow(-1);
        var head = row.insertCell(0);
        head.innerHTML = "<b>"+chrome.i18n.getMessage("AUTHOR_PAGE")+"</b>";
        var body = row.insertCell(1);
        body.appendChild(linkElem);        
    });
}

// Handles loading of history module
function historyModuleLoaded() {
    overrideHistoryModuleUpdateListButton();
    // We have no control over initialization of history module scripts, so we have to wait until they're done
    // and then apply our overrides
    var historyLoading = setInterval(function() {
        var revList = document.getElementById("revision-list");
        if (!revList || (revList.childElementCount > 0)) {
            overrideHistoryModuleUpdateRevisionListPageButtons();
            overrideUserInfoLinks();
            clearInterval(historyLoading);
        }
    }, 1000);
};

/* Function overrides for default handlers */

// Override handler for an element
function overrideElementHandler(elem, tempId, event, handler) {
    var oldId = elem.id;
    elem.id = tempId;
    try {
        injectScript('document.getElementById("'+elem.id+'").setAttribute("'+event+'", '+JSON.stringify(handler)+');');
    } finally {
        if (oldId)
            elem.id = oldId
        else
            elem.removeAttribute("id");
    }                    
}

// Override onclick handlers for all userInfo links in the current document
function overrideUserInfoLinks() {
    if (!scpperSettings.addAuthorPage)
        return;
    var links = document.querySelectorAll("span.printuser a");
    for (var i=0; i<links.length; i++) {
        var onclickText = links[i].getAttribute("onclick");
        var href = links[i].getAttribute("href");
        var userInfoRegEx = /WIKIDOT\.page\.listeners\.userInfo\(\d+\);/;
        var userNameRegEx = /https?:\/\/www\.wikidot\.com\/user:info\/[\w-]+$/i;
        var userInfoCall = userInfoRegEx.exec(onclickText);
        if (userInfoCall && userNameRegEx.test(href)) {
            var userId = /\d+/.exec(userInfoCall[0]);
            var userName = /[\w-]+$/.exec(href);
            if (userId && userName) {
                onclickText = onclickText.replace(userInfoRegEx, "scpperUserInfoDialog("+userId[0]+",\""+userName[0]+"\");");
                overrideElementHandler(links[i], "user_id_"+userId+"_"+i, "onclick", onclickText);
            }
        }
    }
}

function makeUserLink(user) {
    if (Number(user.deleted))
        return user.user;
    else
        return "<a href=\""+scpWebsite.protocol+"://www.wikidot.com/user:info/"+user.userName
            +"\" onclick=\"scpperUserInfoDialog("+user.userId+",&quot;"+user.userName+"&quot;); return false;\">"+user.user+"</a>";
}

// Retrieve page data from SCPper DB and add it to the page
function retrievePageInfo() {
    if (!scpperSettings.addPageInfo)
        return;
    var pageIdRegex = /WIKIREQUEST\.info\.pageId = \d+;/;
    var temp = pageIdRegex.exec(document.head.innerHTML);
    if (!temp)
        return;    
    var pageId = /\d+/.exec(temp[0])[0];
    if (!pageId)
        return;
    var url = "http://scpper.com/extension-page-info?pageId=" + encodeURIComponent(pageId);
    makeXMLHttpRequest(null, url, function(sender, response, success) {
        if (!scpWebsite || !success) 
            return;
        var result = JSON.parse(response);
        var info = document.querySelector("div#page-info");
        if (!result || !info || result.status != 'ok')
            return;
        result = result.data;
        var newInfo = document.createElement("div");
        newInfo.id = "scpper-page-info";
        var authors = [];
        var rewriters = [];
        var translators = [];
        // console.log(response);
        for (var i=0; i<result.authors.length; i++) {
            var userlink = makeUserLink(result.authors[i]);
            switch (result.authors[i].role) {
                case 'Author': 
                    authors.push(userlink);
                    break;
                case 'Rewrite author': 
                    rewriters.push(userlink);
                    break;
                case 'Translator': 
                    translators.push(userlink);
                    break;
            }
        }
        var authorText = "";
        var rewriterText = "";
        var translatorText = "";
        if (result.status == "Original") {
            if (authors.length>0)
                authorText = "Written by "+authors.join(", ")+". ";
        } else {
            var original = "<a href=\""+result.original+"\">Original</a>";
            if (authors.length>0)
                authorText = original+" by "+authors.join(", ")+". ";
            else
                authorText = original+".";
            if (translators.length>0) 
                translatorText = "Translated by "+translators.join(", ")+". ";
        }
        if (rewriters.length>0) 
            rewriterText = "Rewritten by "+rewriters.join(", ")+". ";
        var postingDate = new Date(Number(result.date)*1000);
        var options = { day: 'numeric', month: 'short', year: 'numeric'};
        var createdText = "Posted on "+postingDate.toLocaleString('default', options)+".";
        newInfo.innerHTML = authorText+rewriterText+translatorText+createdText;
        info.insertBefore(newInfo, info.firstChild);
    });
}

// Override history module update list button handler
function overrideHistoryModuleUpdateListButton() {
    var buttons = document.querySelectorAll("#action-area #history-form-1 div.buttons input[type=button]");
    for (var i=0; i<buttons.length; i++)
        if ("WIKIDOT.modules.PageHistoryModule.listeners.updateList(event)" == buttons[i].getAttribute("onclick")) {
            overrideElementHandler(buttons[i], "scpperHistoryModuleUpdateList"+i, "onclick", "scpperHistoryModuleUpdateListButtonClick();");
            break;
        }
}

// Override history module update revision list page button handler
function overrideHistoryModuleUpdateRevisionListPageButtons() {
    var pages = document.querySelectorAll("#revision-list .pager span.target a");    
    for (var i=0; i<pages.length; i++) {
        var onclickText = pages[i].getAttribute("onclick");
        if (/updatePagedList\(\d+\)/.test(onclickText)) {
            var pageNumber = /\(\d+\)/.exec(onclickText);
            if (pageNumber)
                overrideElementHandler(pages[i], "scpperHistoryModuleUpdatePagedList"+i, "onclick", "scpperHistoryModuleUpdatePagedList"+pageNumber[0]+";");
        }
    }
}

// Override button showing who voted on the page
function overrideShowVotersButton() {
    var buttons = document.querySelectorAll("#action-area a");
    for (var i=buttons.length-1; i>=0; i--) {
        var onclickText = buttons[i].getAttribute("onclick");
        if (/WIKIDOT\.modules\.PageRateModule\.listeners\.showWho\(.*\)/.test(onclickText)) {
            var args = /\(.*\)/.exec(onclickText);
            if (args) {
                overrideElementHandler(buttons[i], "scpperShowVotersButtonClick"+i, "onclick", "scpperShowVotersButtonClick"+args[0]+";");
                break;
            }
        }
    }
}