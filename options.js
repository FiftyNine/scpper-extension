var scpperSettings = {};
var statusElement;
var optionsOn;

// Refresh controls on the page in accordance with scpperSettings object
function refreshControls() {	
	var useLinkifier = document.getElementById("use-linkifier");
	useLinkifier.disabled = false;
	useLinkifier.checked = scpperSettings.useLinkifier;	
	var linkifierTemplate = document.getElementById("linkifier-template");
	linkifierTemplate.disabled = !scpperSettings.useLinkifier;		
	switch (scpperSettings.linkifierTemplate) {
		case "strict": 
			linkifierTemplate.value = "strict";
			break;
		case "lax": 
			linkifierTemplate.value = "lax";
			break
		default: 
			linkifierTemplate.value = "smart";
	}
	var authorPage = document.getElementById("author-page-link");
	authorPage.disabled = false;
	authorPage.checked = scpperSettings.addAuthorPage;
	var articleName = document.getElementById("article-name-title");
	articleName.disabled = false;
	articleName.checked = scpperSettings.addArticleName;
	var overrideForum = document.getElementById("override-forum");
	overrideForum.disabled = false;
	overrideForum.checked = scpperSettings.overrideForum;
	var linkTooltips = document.getElementById("link-tooltips");
	linkTooltips.disabled = false;
	linkTooltips.checked = scpperSettings.linkTooltips;	
	// Easter egg part
	var inputs = document.querySelectorAll("input[type=checkbox]");	
	var optionsOn = inputs.length;
	for (var i=0; i<inputs.length; i++)
		if (!inputs[i].checked)
			optionsOn--;
	if (optionsOn == 0)
		statusElement.innerText = chrome.i18n.getMessage("OPTIONS_EASTER_EGG");
	else
		statusElement.innerText = '';
}

// Replaces strings in text nodes with actual text message from current locale
function localize() {	
	var walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
	while (walker.nextNode()) {
		var msgRegEx = /__MSG_\w+__/gm;
		var msg;
		while ((msg = msgRegEx.exec(walker.currentNode.textContent)) != null) {
			var msgName = msg[0].substring(6, msg[0].length-2);
			var localizedMsg = chrome.i18n.getMessage(msgName);
			walker.currentNode.textContent = walker.currentNode.textContent.replace(msg[0], localizedMsg);
			msgRegEx.lastIndex = msgRegEx.lastIndex-msg[0].length+localizedMsg.length;
		}
	}
	// Add credit for the translation as the last line
	var creditText = chrome.i18n.getMessage("TRANSLATION_CREDIT", [chrome.i18n.getMessage("TRANSLATORS")]);
	if (creditText.length>0) {
		var credit = document.createElement("p");
		credit.className = "footnote";
		credit.innerHTML = creditText;
		document.body.appendChild(credit);
	}
}

// Perform necessary initialization
function initOptions() {
	localize();
	statusElement = document.getElementById("status");
	var inputs = document.querySelectorAll("input");
	// Disable everything until settings are initialized
	for (i in inputs)
		i.disabled = true;
	// Assign handlers
	document.getElementById("use-linkifier").addEventListener("click", useLinkifierClick);
	document.getElementById("linkifier-template").addEventListener("click", linkifierTemplateClick);
	document.getElementById("author-page-link").addEventListener("click", authorPageClick);
	document.getElementById("article-name-title").addEventListener("click", articleNameClick);
	document.getElementById("override-forum").addEventListener("click", overrideForumClick);
	document.getElementById("link-tooltips").addEventListener("click", linkTooltipsClick);
	// Initialize settings
	chrome.storage.sync.get("scpperSettings", function(value) {
		if (value["scpperSettings"]) {
			scpperSettings = value["scpperSettings"];			
		} else {
			scpperSettings = scpperDefaultSettings;
		}
		refreshControls();
	});
}

// Save settings to Chrome storage
function setOptionAndSave(name, value) {
	var newValue = JSON.parse(JSON.stringify(scpperSettings));
	newValue[name] = value;
	chrome.storage.sync.set({"scpperSettings": newValue}, function() {
		if (!chrome.runtime.lastError) {
			scpperSettings = newValue;
		} else if (statusElement) {
			statusElement.innerText = chrome.i18n.getMessage("OPTIONS_SAVING_ERROR", [chrome.runtime.lastError.message]);
		}
		refreshControls();
	});
}

/* Event handlers */

function useLinkifierClick() {
	setOptionAndSave("useLinkifier", this.checked);
}

function linkifierTemplateClick() {
	setOptionAndSave("linkifierTemplate", this.value);
}

function authorPageClick() {
	setOptionAndSave("addAuthorPage", this.checked);
}

function articleNameClick() {
	setOptionAndSave("addArticleName", this.checked);
}

function overrideForumClick() {
	setOptionAndSave("overrideForum", this.checked);
}

function linkTooltipsClick() {
	setOptionAndSave("linkTooltips", this.checked);
}

/*                             */

document.addEventListener("DOMContentLoaded", initOptions);