// Main thing that does all the stuff
function runSCPper() {
	DEBUG && chrome.storage.local.getBytesInUse(null, function (bytes) {console.log("Local storage uses "+bytes+" bytes.")});
	DEBUG && chrome.storage.local.clear();
	initScpperSettings();	
	var tryCount = 0;
	var interval = setInterval(function() {	
		if (scpperSettings) {
			scpWebsite = identifyScpWebsite(document.URL);
			if (scpWebsite!=null) {				
				DEBUG && console.time("Linkifier");
				if (processWiki())					
					DEBUG && console.timeEnd("Linkifier");
			}			
			DEBUG && console.time("LinkEnhancer");
			if (DEBUG)
				enhanceLinks()
			else
				setTimeout(enhanceLinks, 0);
			DEBUG && console.timeEnd("LinkEnhancer");
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