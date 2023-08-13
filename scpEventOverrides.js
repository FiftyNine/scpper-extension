/*
This module contains functions that are used by SCPper Chrome extension to override default behaviour on SCP wiki and its regional branches
*/

function sendMessageToScpper(message) {
    var messageEvent = new CustomEvent('ScpperExternalMessage', {detail: message});
    document.dispatchEvent(messageEvent);
}

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
            sendMessageToScpper(message);
        }
    });
    try {
        listener.apply(null, args);
    } finally {
        setCallback(oldCallback);
    }
}

// Override for user info dialog click
function scpperUserInfoDialog(userId, aUserName) {
    scpperDefaultHandlerOverride(WIKIDOT.page.listeners.userInfo, function(f) {
        var res = WIKIDOT.page.callbacks.userInfo;
        WIKIDOT.page.callbacks.userInfo = f;
        return res;},
        {text: "USER_INFO_DIALOG_EXTERNAL", userName: aUserName, userId: userId},
        [userId]);
}

// Override for forum page clicks
// Probably unnecessary in the current version, but it works so let it be
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
        }
    );
}

// Override for forum loading page for a specific post
// Probably unnecessary in the current version, but it works so let it be
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
        },
        null,
        {ignoreCodeZero: true}
    );
}

// Change handlers so when user clicks on a linked username we call
// our wrapper instead of default WIKIDOT handler
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
                links[i].setAttribute("onclick", onclickText);
            }
        }
    }
}

// Observe action area at the bottom of the page (history, voters, etc)
// so we can react to XHR and process new DOM elements as they are added
var actionArea = document.getElementById("action-area");
if (actionArea) {
    // Options for the observer (which mutations to observe)
    var config = { childList: true, subtree: true };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(
        function(mutationsList) {
            overrideUserInfoLinks();
        });

    // Start observing the target node for configured mutations
    observer.observe(actionArea, config);
}
// Observe forum thread container to catch use going from page to page
// so we can react to XHR and process new posts as they are added
var threadContainerPosts = document.getElementById("thread-container-posts");
if (threadContainerPosts) {
    // Options for the observer (which mutations to observe)
    var config = { childList: true};

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(
        function(mutationsList) {
            sendMessageToScpper({text: "FORUM_POSTS_UPDATED_EXTERNAL"});
            overrideUserInfoLinks();
        });

    // Start observing the target node for configured mutations
    observer.observe(threadContainerPosts, config);
}

// Manifest V3 is very secure so for a lot of things we have to ping-pong
// messages between the page and extension
document.addEventListener("ScpperExternalResponse", function(event) {
    if (event.detail.text == "RETURN_SCPPER_SETTINGS") {
        scpperSettings = event.detail.settings;
        overrideUserInfoLinks();
    } else if (event.detail.text == "LOAD_FORUM_POST") {
        scpperForumLoadPostOverride(event.detail.postId)
    } else if (event.detail.text == "LOAD_FORUM_PAGE") {
        scpperForumChangePageHandler(event.detail.page)
    }
});

// We need settings to know if we should override user info dialog
// and I don't think we can get them directly from the page context
sendMessageToScpper({text: "REQUEST_SCPPER_SETTINGS"});