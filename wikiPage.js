var WIKI_PAGE_TITLE_ELEMENT_ID = "page-title";
var WIKI_PAGE_CONTENT_ELEMENT_ID = "page-content";
var WIKI_PAGE_TAGS_ELEMENT_CLASS_NAME = "page-tags";
var WIKI_PAGE_TITLE_TEMPLATE = "^\\s*SCP-\\d{3,4}\\s*$";
var WIKI_PAGE_TAG_HREF_TEMPLATE = "/system:page-tags/tag/";
var WIKI_PAGE_IGNORE_ELEM_CLASSES = ["A", "IMG", "SCRIPT"]

var pageScpNumber="";

// Recursively process DOM nodes of a main wiki page and linkify text nodes
function enumWikiPageChildNodes(node, linkedNumbers) {	
	// Linkify lowest level text nodes
	if ((node.childNodes.length == 0) && (node.nodeType == Node.TEXT_NODE))
		scpLinkifyTextNode(node, linkedNumbers);
	// Skip certain nodes
	else if ((WIKI_PAGE_IGNORE_ELEM_CLASSES.indexOf(node.nodeName.toUpperCase()) == -1) 
		&& (scpWebsite.ignoreElements.indexOf(node.className.toUpperCase()) == -1)) {
			for (var i=0; i<node.childNodes.length; i++)
				enumWikiPageChildNodes(node.childNodes[i], linkedNumbers);		
	// Add links to the list of linked SCPs
	} else 
		scpAddLinkedNumber(node, linkedNumbers);
}

// Enumerate page tags
function enumPageTags(elem) {
	var found = false;
	if ((elem.nodeName.toUpperCase()=='A') && (new RegExp(WIKI_PAGE_TAG_HREF_TEMPLATE, "i").test(elem.getAttribute("href")))
		&& (scpWebsite.permittedTags.indexOf(elem.textContent.toUpperCase())>=0))
			return true;
	for (var i=0; (i<elem.children.length) && !found; i++)
		found=found||enumPageTags(elem.children[i]);
	return found;
}

// Check if page contains at least one tag from the current site tag list
function checkPageTags() {	
	var tagsElements = document.getElementsByClassName(WIKI_PAGE_TAGS_ELEMENT_CLASS_NAME);
	var result=(tagsElements!=null)&&enumPageTags(tagsElements[0]);
	return result;
}

// Process a main site page (SCP, tale, etc...)
function processWikiPage() {
	var linkedNumbers=[];	
	// Don't process pages without specific tags
	if (scpWebsite.checkTags && !checkPageTags())
		return;
	var titleRegEx = new RegExp(WIKI_PAGE_TITLE_TEMPLATE, "igm");			
	// var title = "";
	var titleElement = document.getElementById(WIKI_PAGE_TITLE_ELEMENT_ID);		
	if ((titleElement != null) && titleRegEx.test(titleElement.textContent)) {					
		//titleRegEx.lastIndex = 0;
		var tmp = /\d{3,4}/.exec(titleElement.textContent);
		if (tmp != null) {
			pageScpNumber = tmp[0];
			linkedNumbers.push(pageScpNumber);
		}
		// Add article name
		if (pageScpNumber != "") {			
			getScpName(scpWebsite, pageScpNumber, function(name) {
				if (name)
					titleElement.textContent = titleElement.textContent.trim() + " - " + name;
			});
		}
	} 
	// Only use strict template for SCP articles, use lax template for tales, supplements and forum
	if (pageScpNumber == "")
		scpTemplate = SCP_TEMPLATE_LAX;
	else
		scpTemplate = SCP_TEMPLATE_STRICT;	
	var contentElement = document.getElementById(WIKI_PAGE_CONTENT_ELEMENT_ID);
	if (contentElement == null) {
		console.log("Error: PageContent not found");
		return;
	}					
	enumWikiPageChildNodes(contentElement, linkedNumbers);
}