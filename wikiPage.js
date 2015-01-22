var WIKI_PAGE_TITLE_ELEMENT_ID = "page-title";
var WIKI_PAGE_CONTENT_ELEMENT_ID = "page-content";
var WIKI_PAGE_TAGS_ELEMENT_CLASS_NAME = "page-tags";
var WIKI_PAGE_TAG_HREF_TEMPLATE = "/system:page-tags/tag/";
var WIKI_PAGE_IGNORE_ELEM_CLASSES = ["A", "IMG", "SCRIPT"]

var pageScpNumber="";

// Recursively process DOM nodes of a main wiki page and linkify text nodes
function enumWikiPageChildNodes(node, linkedNumbers, template, strict) {
	if (!scpperSettings.useLinkifier)
		return;
	// Linkify lowest level text nodes
	if ((node.childNodes.length == 0) && (node.nodeType == Node.TEXT_NODE))
		scpLinkifyTextNode(node, linkedNumbers, template, strict);
	// Skip certain nodes
	else if ((WIKI_PAGE_IGNORE_ELEM_CLASSES.indexOf(node.nodeName.toUpperCase()) == -1)
		&& (scpWebsite.ignoreElements.indexOf(node.className.toUpperCase()) == -1)) {
			for (var i=0; i<node.childNodes.length; i++)
				enumWikiPageChildNodes(node.childNodes[i], linkedNumbers, template, strict);
	// Add links to the list of linked SCPs
	} else
		scpAddLinkedNumber(node, linkedNumbers);
}

// Enumerate page tags
function enumPageTags(elem) {
	var found = false;
	if ((elem.nodeName.toUpperCase()=='A') && (new RegExp(WIKI_PAGE_TAG_HREF_TEMPLATE, "i").test(elem.getAttribute("href")))
		&& (scpWebsite.permittedTags.indexOf(elem.textContent)>=0))
			return true;
	for (var i=0; (i<elem.children.length) && !found; i++)
		found=found||enumPageTags(elem.children[i]);
	return found;
}

// Check if page contains at least one tag from the current site tag list
function checkPageTags() {	
	var tagsElements = document.getElementsByClassName(WIKI_PAGE_TAGS_ELEMENT_CLASS_NAME);
	var result=(tagsElements) && (tagsElements.length > 0) && enumPageTags(tagsElements[0]);
	return result;
}

// Process a main site page (SCP, tale, etc...)
function processWikiPage() {
	var linkedNumbers={};		
	// Don't process pages without specific tags
	if (scpWebsite.checkTags && !checkPageTags())
		return;	
	// Find this page's object number (including suffix) and add it to linked numbers
	// Also add all subset number (i.e. if number is "123-RU-J", add "123-RU" and "123" too
	var href = /^https?:\/\/[^\/]+\/[^\/]+/i.exec(document.URL);
	for (var i=scpWebsite.articleTemplates.length-1; (i>=0) && href; i--) {	
		var template = scpWebsite.articleTemplates[i];		
		var scpName = new RegExp(template.urlTemplate.replace('@', template.numberRegEx)+"$", "ig").exec(href[0]);
		if (scpName) {					
			var tmp = new RegExp(template.numberRegEx, "i").exec(scpName[0]);
			if (tmp != null) {
				if (!pageScpNumber) {
					pageScpNumber = tmp[0];
					// Add article name
					if ((pageScpNumber != "") && (scpperSettings.addArticleName)) {			
						getScpName(scpWebsite, pageScpNumber, function(name) {
							var titleElement = document.getElementById(WIKI_PAGE_TITLE_ELEMENT_ID);										
							if (name && titleElement && titleElement.innerText.trim().toUpperCase() == "SCP-"+pageScpNumber.toUpperCase())
								titleElement.textContent = titleElement.textContent.trim() + " - " + name;
						});
					}						
				}
				linkedNumbers[tmp[0].toUpperCase()]=1;
				href[0] = href[0].substring(0, href[0].lastIndexOf('-'));
			}
		} 		
	}					
	// Only use strict template for SCP articles, use lax template for tales, supplements and forum
	if (scpperSettings.useLinkifier) {
		var contentElement = document.getElementById(WIKI_PAGE_CONTENT_ELEMENT_ID);
		if (contentElement == null) {
			console.log("Error: PageContent not found");
			return;
		}					
		var strict = true;
		if (scpperSettings.linkifierTemplate == "lax") 		
			strict = false;
		for (var i=scpWebsite.articleTemplates.length-1; i>=0; i--)
			enumWikiPageChildNodes(contentElement, linkedNumbers, scpWebsite.articleTemplates[i], strict);
	}	
}