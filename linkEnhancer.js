// Set link title
function setLinkTitle(link, scpSite, scpNumber) {
	getScpName(scpSite, scpNumber, function(scpName) {
		if (scpName) link.title = scpName;
	});
}

// Add button for a popup dialog to a link
function addLinkPopupDialog(link, website, scpNumber) {
	var popupLink = document.createElement("a");
	popupLink.href = "javascript:;";
	popupLink.innerHTML = "<sup>?</sup>";
	var next = link.nextSibling;
	if (next)
		link.parentNode.insertBefore(popupLink, next)
	else
		link.parentNode.appendChild(popupLink);
}

// Enhance SCP links on a page by adding tooltips 
function enhanceLinks() {
	if (!scpperSettings.linkTooltips)
		return;
	for (var i=0; i<document.links.length; i++) {
		var link = document.links[i];
		if (link.nodeName.toUpperCase() == 'A') {
			var isScp = false;		
			var scpNumber;
			var scpSite = identifyScpWebsite(link.href);
			if (scpSite)
			{
				for (var k=0; k<scpSite.linkTemplates.length; k++)
				{
					var linkRegEx = new RegExp(scpSite.linkTemplates[k]+"/"+SCP_TEMPLATE_STRICT+"\\b", "ig");
					if (linkRegEx.test(link.href)) {
						isScp = true;
						scpNumber = /\d{3,4}\b/.exec(link.href);
						break;
					}
				}
				if (isScp && scpNumber){
					if (!link.title)
						setLinkTitle(link, scpSite, scpNumber[0]);
	//				addLinkPopupDialog(link, scpSite, scpNumber[0]);
				}
			}
		}
	}
}