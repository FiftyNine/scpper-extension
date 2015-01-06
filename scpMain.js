// Main thing that does all the stuff
function runSCPper() {
	DEBUG && chrome.storage.local.getBytesInUse(null, function (bytes) {console.log("Local storage uses "+bytes+" bytes.")});
	// chrome.storage.local.clear();
	initScpperSettings();	
	var tryCount = 0;
	var interval = setInterval(function() {	
		if (scpperSettings) {
			scpWebsite = identifyScpWebsite(document.URL);
			if (scpWebsite!=null) {
				if (processWiki())
					DEBUG && console.log(document.URL+" linkified");
			}			
			enhanceLinks();
			clearInterval(interval);
		} else {
			// give up after 3 seconds of trying to retrieve settings
			tryCount++;
			if (tryCount >= 30) {
				clearInterval(interval);			
				throw "Error: Couldn't retrieve SCPper settings";
			}
		}
	}, 100);
}

/* Subscribing to events */

document.addEventListener("DOMContentLoaded", runSCPper, false);