var scpTemplate, scpSearchTemplate;


// Add linked SCP from an <a> elem
function scpAddLinkedNumber(node, linkedNumbers) {
	if (node.nodeName.toUpperCase()=="A") {
		var ref = new RegExp(SCP_TEMPLATE_STRICT, "i").exec(node.getAttribute("href"));
		if (ref != null) {
			var num = /\d{3,4}/.exec(ref[0]);
			if (num != null)
				linkedNumbers[num[0]]=1;
		}
	}
}	

// Process a text node and convert matching text into SCP links
function scpLinkifyTextNode(node, linkedNumbers) {
	if (!scpperSettings.useLinkifier)
		return;
	var scpSearchTemplate = "([\\W_]|\\b)"+scpTemplate+"([\\W_]|\\b)";
	var parent = node.parentElement;	
	if (!node.nodeValue || (parent == null))
		return;
	var scpRegEx = new RegExp(scpSearchTemplate, "igm");
	var trimmedScpRegEx = new RegExp(scpTemplate, "igm");		
	var oldText = node.nodeValue;
	var found = false;
	var scpMatch, trimmedMatch;
	var prevPos = 0;	
	var tmp = 0;			
	while ((scpMatch = scpRegEx.exec(oldText)) != null) {
		found = true;		
		var scpNumber = /\d{3,4}/.exec(scpMatch[0]);
		if ((scpNumber != null) && (Number(scpNumber[0]) < MAX_SCP_NUMBER) && (!linkedNumbers[scpNumber[0]])
			/*&& (Number(scpNumber[0]).toString()==scpNumber[0])*/) {										
				trimmedScpRegEx.lastIndex = scpRegEx.lastIndex-scpMatch[0].length; 
				//console.log(trimmedScpRegEx.lastIndex+" "+scpMatch[0].length+" \""+scpMatch[0]+"\" \""+oldText+"\"");
				trimmedMatch = trimmedScpRegEx.exec(oldText);
				//console.log("\""+scpMatch[0]+"\" \""+trimmedMatch[0]+"\"");
				var text = oldText.substring(prevPos, trimmedScpRegEx.lastIndex-trimmedMatch[0].length);
				var textNode = document.createTextNode(text);
				parent.insertBefore(textNode, node);
				var scpLink = document.createElement('a');
				var scpLinkText = document.createTextNode(trimmedMatch[0]);
				scpLink.setAttribute("href", "/scp-"+scpNumber[0]);
				
/*				scpLink.title="asdsad";
				if (scpLink.className)
					scpLink.className = scpLink.className+" scpArticleLink"
				else
					scpLink.className = "qweasd scpArticleLink";
					
				$(scpLink).mouseenter(function () {$("#scpTestDialog").dialog("open");});				
				$(scpLink).mouseleave(function () {$("#scpTestDialog").dialog("close");});				*/
				scpLink.appendChild(scpLinkText);
				//console.log(scpLink.getAttribute("href"));
				parent.insertBefore(scpLink, node);
				scpAddLinkedNumber(scpLink, linkedNumbers);
				//linkedNumbers.push(scpNumber[0]);
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
	var userRegEx = new RegExp("http://www\\.wikidot\\.com/user:info/"+userName+"$");
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
	makeXMLHttpRequest(null, scpWebsite.primaryLink+scpWebsite.membersPages, function(sender, response) {
		var doc = document.implementation.createHTMLDocument("");
		doc.write(response);
		var memberPage = getUserMemberPageLinkFromDoc(doc, userName);
		if (memberPage)
			callback(memberPage);
	});
}

// Process user info dialog and add link to the correspondent member page
function processUserInfoDialog(userName) {
	if (!scpperSettings.addAuthorPage)
		return;
	getUserMemberPageLink(userName, function(memberPage) {
		var dialogElem = document.getElementById("odialog-container");	
		if (!dialogElem || (dialogElem.childNodes.length == 0) || !memberPage)
			return;
		var tableElem = dialogElem.querySelector("div.content.modal-body table");
		if (!tableElem)
			return;
		var linkElem = document.createElement("a");
		linkElem.innerText = memberPage.text;
		linkElem.setAttribute("href", memberPage.link);
		var row = tableElem.insertRow(-1);
		var head = row.insertCell(0);
		head.innerHTML = "<b>SCP author page:</b>";
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

// Override a button interacting with action area
function overrideWikiBottomButton(id, onclick) {
	// This button is handled somewhere deep in the wikidot core, so we just swap it with our own button and our own handler	
	var button = document.getElementById(id);
	if (!button || (button.style.display == "none"))
		return;
	var myButton = button.cloneNode(true);
	myButton.id = "scpper-"+id;
	button.parentElement.insertBefore(myButton, button);
	button.style.display = "none";
	myButton.setAttribute("onclick", onclick);
	injectScript(
		'function initScpperBottomButton(buttonId) {'+
		'var button = document.getElementById(buttonId);'+
		'var tip = document.getElementById(buttonId+"hovertip");'+
		'if (tip && button)'+
		'	OZONE.dialog.hovertip.makeTip(button, {context: tip, delay: 700, valign: "center"});'+
		'}'+
		'initScpperBottomButton("'+myButton.id+'");');
}

// Override buttons interacting with action area
function overrideWikiBottomButtons() {
	overrideWikiBottomButton("history-button", "scpperHistoryButtonClick();");
	overrideWikiBottomButton("pagerate-button", "scpperPageRateButtonClick();");
}

// Override onlick handlers for all userInfo links in the current document
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