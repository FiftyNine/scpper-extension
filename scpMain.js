// Main thing that does all the stuff
function runSCPper() {
	// chrome.storage.local.clear();
	chrome.storage.local.getBytesInUse(null, function (bytes) {console.log("Local storage uses "+bytes+" bytes.")});
	scpWebsite = identifyScpWebsite(document.URL);
	if (scpWebsite!=null) {
		if (processWiki())
			console.log(document.URL+" linkified");
	}
	enhanceLinks();
}

/* Subscribing to events */

document.addEventListener("DOMContentLoaded", runSCPper, false);

/* TODO
Options page
Add other site branches

Add image/description to hint?

Add author at the bottom of the page (wait for API key?)

Cache member pages?
Localization for: "SCP author page:" (kr: 회원 페이지, jp: )
Support for branch SCP articles?

*/