// List of all supported SCP websites and their properties
// Names must be unique!
var SCP_WEBSITES = [
	{name: "English", 
	primaryLink: "http://www.scp-wiki.net",
	linkTemplates: ["(www\\.)?scp-wiki\\.net", "(www\\.)?scp-wiki\\.wikidot\\.com"],
	checkTags: true,
	permittedTags: ["SCP", "TALE", "SUPPLEMENT"],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
	mainListPages: ["/scp-series", "/scp-series-2", "/scp-series-3"],
	membersPages: "/members-pages"
	},
	{name: "Russian",
	primaryLink: "http://scpfoundation.ru",
	linkTemplates: ["(www\\.)?scpfoundation\\.ru", "(www\\.)?scp-ru\\.wikidot\\.com"],
	checkTags: false,
	permittedTags: [],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK", "RIMG"],
	mainListPages: ["/scp-list", "/scp-list-2", "/scp-list-3"],
	membersPages: null
	},
	{name: "Korean",
	primaryLink: "http://ko.scp-wiki.net/",
	linkTemplates: ["ko\\.scp-wiki\\.net", "(www\\.)?scp-kr\\.wikidot\\.com"],
	checkTags: true,
	permittedTags: ["SCP", "이야기", "보충"],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
	mainListPages: ["/scp-series", "/scp-series-2", "/scp-series-3"],
	membersPages: "/members-pages-ko"
	}
	];

var MAX_SCP_NUMBER = 3000;
var SCP_TEMPLATE_LAX = "(SCP-)?\\d{3,4}";
var SCP_TEMPLATE_STRICT = "SCP-\\d{3,4}";
var SCP_NAME_CACHE_EXPIRATION = 1000*60*60*24*7; // Milliseconds in a week

var DEBUG = false;

// Format of last refresh time in storage of SCP names for a site: "SITENAMELastRefreshTime"
// Format of SCP name in storage: "SITENAMESCP###NAME"

// Current scp website	
var scpWebsite;		
// Settings
var scpperSettings;
	
function makeXMLHttpRequest(sender, url, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200)
				callback(sender, request.responseText); 
	}
	request.open("GET", url, true);
	request.send();
}

// Get extension settings
function initScpperSettings() {
	chrome.storage.sync.get("scpperSettings", function (value) {
		if (!chrome.runtime.lastError)
			scpperSettings = value["scpperSettings"]
		else
			console.log("Unexpected error while retrieving SCPper settings: "+chrome.runtime.lastError.message);
	});
}

// Inject a script file into document
function injectExtensionScript(fileName, onLoadScript) {
	var myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.src = chrome.extension.getURL(fileName);
	if (onLoadScript)	
		myScript.setAttribute("onload", onLoadScript)
	else
		myScript.onload = function () {myScript.parentNode.removeChild(myScript)};
	document.head.appendChild(myScript);
}	

// Inject script into document
function injectScript(scriptText) {
	var myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.text = scriptText;
	document.head.appendChild(myScript);
	myScript.parentNode.removeChild(myScript);
}	
	
// Figure out website by URL
function identifyScpWebsite(URL) {
	for (var i=0; i<SCP_WEBSITES.length; i++)
		for (var j=0; j<SCP_WEBSITES[i].linkTemplates.length; j++) {
			var linkRegEx = new RegExp("\\bhttps?://"+SCP_WEBSITES[i].linkTemplates[j]);
			if (linkRegEx.test(URL)) {
				return SCP_WEBSITES[i];
			}
		}
}

// Check if we're on forum or main wiki
function checkIfForum() {
	for (var i=0; i<scpWebsite.linkTemplates.length; i++) {
		var forumRegEx = new RegExp("\\bhttps?://"+scpWebsite.linkTemplates[i]+"/forum");
		if (forumRegEx.test(document.URL)) {
			return true;
		}
	}
	return false;
}

// Extracts scp names from document and places them into array of pairs {number, name}
function extractScpNames(doc) {
	var list = [];
	for (var i=0; i<doc.links.length; i++) {
		var link = doc.links[i];
		var href = link.attributes["href"].value;		
		if ((link.nodeName.toUpperCase() == 'A')&&(new RegExp("/"+SCP_TEMPLATE_STRICT+"\\b", "i").test(href))) {
			var scpNumber = /\d{3,4}$/.exec(href);
			var text = "";
			var textElem = link.nextSibling;
			while (textElem && (text.search("\n")<0)) {
				text=text+textElem.textContent;
				textElem = textElem.nextSibling;
			}
			var scpName = "";
			if (text) {
				scpName = /[^\s-].*/.exec(text);
				if (scpName)
					list.push({number: scpNumber[0], name: scpName[0]});
			}
		}
	}
	return list;
}

var cacheInProgress = [];
var waitingCallbacks = [];

// Fill SCP name cache 
function fillScpNameCache(website, callback) {
	var index = cacheInProgress.indexOf(website.name)
    if (index >= 0) {
		waitingCallbacks[index].callbacks.push(callback);
		return;
	}
	index = cacheInProgress.push(website.name)-1;
	waitingCallbacks.push({website: website.name, callbacks: [callback]});	
	var pagesLeft = website.mainListPages.length;
	var errors = false;
	for (var i=0; i<website.mainListPages.length; i++) {
	var url = website.primaryLink+website.mainListPages[i];
	makeXMLHttpRequest(null, url, function(sender, response) {
		var doc = document.implementation.createHTMLDocument("");
		doc.write(response);
		var list = extractScpNames(doc);
		var storeObj = {};
		for (var j=0; j<list.length; j++)
			storeObj[website.name+"SCP"+list[j].number+"NAME"] = list[j].name;
		chrome.storage.local.set(storeObj, function(){
			if (chrome.runtime.lastError)
				errors = true;
			pagesLeft--;
			if (pagesLeft == 0) {
				if (!errors)
				{
					var dateObj = {};
					dateObj[website.name+"LastRefreshTime"] = new Date().toString();
					chrome.storage.local.set(dateObj);
				}
				for (var i=0; i<waitingCallbacks[index].callbacks.length; i++)
					waitingCallbacks[index].callbacks[i]();
				waitingCallbacks.splice(index, 1);
				cacheInProgress.splice(index, 1);
			}
		});
	});
  }  
}


// Check if local cache for article names on the specified site is filled and up-to-date. Refresh if necessary
function validateScpNameCache(website, callback) {
	var refreshName = website.name+"LastRefreshTime";	
	chrome.storage.local.get(refreshName, function(item) {
		var needRefresh = (item[refreshName] == null);
		if (!needRefresh) {
			var now = new Date();
			var lastRefresh = new Date(item[refreshName]);
			needRefresh = now - lastRefresh > SCP_NAME_CACHE_EXPIRATION;
		}
		if (!needRefresh)
			callback()
		else
			fillScpNameCache(website, callback);
	})
}

// Get SCP article name from the mainlist
function getScpName(website, number, callback) {
	validateScpNameCache(website, function() {
		var nameKey = website.name+"SCP"+number+"NAME";
		chrome.storage.local.get(nameKey, function(item) {
			callback(item[nameKey]);
	});
  });
}