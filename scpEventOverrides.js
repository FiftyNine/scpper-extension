/*
This module contains functions that are used by SCPper Chrome extension to override default behaviour on SCP wiki and its regional branches
*/

var SCPPER_EXTENSION_ID = "cpebggobaenfndpoddkdindknnpbjdfc";

// Default wrapper for overriden functions
function scpperDefaultHandlerOverride(listener, setCallback, message, args) {	
	var oldCallback = setCallback(function (a) {
			// Check for errors
			if(!WIKIDOT.utils.handleError(a))
				return;
			try {
				// Call original callback
				oldCallback(a);
			} finally {				
				// Send message home 
				chrome.runtime.sendMessage(SCPPER_EXTENSION_ID, message);		
			}
	});
	try {
		listener.apply(null, args);
	} finally {
		setCallback(oldCallback);
	}
}

// Override for forum page clicks
function scpperForumChangePageHandler(a) {
	// Unfortunately original handler uses anonymous inline function for a callback, 
	// so we're gonna have to override it completely
	OZONE.ajax.requestModule(
		"forum/ForumViewThreadPostsModule",
		{
			pageNo:a,
			t:WIKIDOT.forumThreadId,
			order:($j("#thread-container").hasClass("reverse"))?"reverse":""
		},
		function(b){
			if (!WIKIDOT.utils.handleError(b))
				return;
			$j("#thread-container-posts").html(b.body);
			chrome.runtime.sendMessage(SCPPER_EXTENSION_ID, {text: "FORUM_POSTS_UPDATED_EXTERNAL"});
			OZONE.visuals.scrollTo("thread-container");			
		}
	);
}

// Override for user info dialog click
function scpperUserInfoDialog(userId, aUserName) {
	scpperDefaultHandlerOverride(WIKIDOT.page.listeners.userInfo, function(f) {
		var res = WIKIDOT.page.callbacks.userInfo;
		WIKIDOT.page.callbacks.userInfo = f;
		return res;}, 
		{text: "USER_INFO_DIALOG_EXTERNAL", userName: aUserName},
		[userId]);
}

// Override for history button click
function scpperHistoryButtonClick() {
	scpperDefaultHandlerOverride(WIKIDOT.page.listeners.historyClick, function(f) {
		var res = WIKIDOT.page.callbacks.historyClick;
		WIKIDOT.page.callbacks.historyClick = f;
		return res;}, 
		{text: "HISTORY_MODULE_LOADED_EXTERNAL"});
}

// Override for UpdateList button in history module
function scpperHistoryModuleUpdateListButtonClick() {
	scpperDefaultHandlerOverride(WIKIDOT.modules.PageHistoryModule.listeners.updateList, function(f) {
		var res = WIKIDOT.modules.PageHistoryModule.callbacks.updateList;
		WIKIDOT.modules.PageHistoryModule.callbacks.updateList = f;
		return res;}, 
		{text: "ACTION_AREA_UPDATED_EXTERNAL"});
}

// Override for pages of revision list on historyModule
function scpperHistoryModuleUpdatePagedList(a) {
	scpperDefaultHandlerOverride(updatePagedList, function(f) {
		var res = WIKIDOT.modules.PageHistoryModule.callbacks.updatePageList;
		WIKIDOT.modules.PageHistoryModule.callbacks.updatePageList = f;
		return res;}, 
		{text: "ACTION_AREA_UPDATED_EXTERNAL"},
		[a]);
}

// Override for pagerate button click
function scpperPageRateButtonClick() {
	scpperDefaultHandlerOverride(WIKIDOT.page.listeners.pageRate, function(f) {
		var res = WIKIDOT.page.callbacks.pageRate;
		WIKIDOT.page.callbacks.pageRate = f;
		return res;}, 
		{text: "PAGERATE_MODULE_LOADED_EXTERNAL"});
}

// Override for show people who rated this page button
function scpperShowVotersButtonClick(a, b) {
	// Apparently original function doesn't use arguments, but still
	scpperDefaultHandlerOverride(WIKIDOT.modules.PageRateModule.listeners.showWho, function(f) {
		var res = WIKIDOT.modules.PageRateModule.callbacks.showWho;
		WIKIDOT.modules.PageRateModule.callbacks.showWho = f;
		return res;}, 
		{text: "ACTION_AREA_UPDATED_EXTERNAL"},
		[a, b]);	
}

// Override for forum loading page for a specific post
function scpperForumLoadPostOverride(post_id) {
	OZONE.ajax.requestModule(
		"forum/ForumViewThreadPostsModule", 
		{ postId: post_id,
			t: WIKIDOT.forumThreadId,
			order: ($j("#thread-container").hasClass("reverse")) ? "reverse" : ""
		}, 
		function(c) {
			$j("#thread-container-posts").show();
			if (c.status == "no_post" || !WIKIDOT.utils.handleError(c)) {
				return
			}
			$j("#thread-container-posts").html(c.body);
			chrome.runtime.sendMessage(SCPPER_EXTENSION_ID, {text: "FORUM_POSTS_UPDATED_EXTERNAL"});
			OZONE.visuals.scrollTo("thread-container-posts");
		}, 
		null, 
		{ignoreCodeZero: true}
	);
}