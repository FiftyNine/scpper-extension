// Process post's content, linkify text nodes and add linked numbers
function scpProcessForumPostContent(node, linkedNumbers, template, strict) {
    if ((node.childNodes.length == 0) && (node.nodeType == Node.TEXT_NODE))
        scpLinkifyTextNode(node, linkedNumbers, template, strict)
    // Skip certain nodes
    else if (node.nodeName.toUpperCase()!='A')
            for (var i=0; i<node.childNodes.length; i++)
                scpProcessForumPostContent(node.childNodes[i], linkedNumbers, template, strict);
    else
        scpAddLinkedNumber(node, linkedNumbers);
}

// Iterate through all posts on a page and linkify them
function scpForumProcessPosts() {
    if (!scpperSettings.useLinkifier)
        return;
    var strict = false;        
    if (scpperSettings.linkifierTemplate == "strict")         
        strict = true;            
    var linkedNumbers = {};
    var posts = document.querySelectorAll("#thread-container .content[id^=post-content-]");
    for (var i=0; i<posts.length; i++) 
        if (/^post-content-\d+$/i.test(posts[i].id)) {            
            for (var j=scpWebsite.articleTemplates.length-1; j>=0; j--)
                scpProcessForumPostContent(posts[i], linkedNumbers, scpWebsite.articleTemplates[j], strict);
        }
}

// Override handlers on active page switch to use my handlers instead of default
function scpForumOverridePageHandlers(){
    var pagers = document.querySelectorAll("div#thread-container-posts div.pager");
    if (pagers==null) return;
    for (var i=0; i<pagers.length; i++) {    
        var pageLinks = pagers[i].getElementsByClassName("target");
        for (var j=0; j<pageLinks.length; j++) {
            var linkElem = pageLinks[j].firstElementChild;
            if (linkElem.nodeName.toUpperCase()=="A") {
                var onclickText = linkElem.getAttribute("onclick");
                var clickNumber = /\(\d+\)/.exec(onclickText);
                if (clickNumber != null) {                    
                    onclickText = "scpperForumChangePageHandler("+clickNumber[0].slice(1, clickNumber[0].length-1)+")";
                    overrideElementHandler(linkElem, "pageLink_id_"+i+"_"+j, "onclick", onclickText);
                }
            }
        }
    }
}


//Runs after coming to a new page, set anchor by the first post of the page
function setForumPostAnchor() {
    if (!scpperSettings.overrideForum)
        return;
    var currentPage = document.querySelector("#thread-container-posts .pager span.current");
    if (currentPage && (currentPage.innerText != "1")) {    
        var firstPost = document.querySelector("#thread-container-posts .post[id^=post-]");
        if (firstPost && /^post-\d+$/.test(firstPost.id)) {
            var postId = firstPost.id;        
            // Do that so it won't scroll to the post
            firstPost.removeAttribute("id");
            try {
                location.hash = "#"+postId;
            } finally {
                firstPost.id = postId;
            }
        }
    } else {
        // Prevent scrolling by storing the page's current scroll offset
        var scrollV = document.body.scrollTop;
        var scrollH = document.body.scrollLeft;
        try {
            location.hash = '';
        } finally {        
            // Restore the scroll offset, should be flicker free
            document.body.scrollTop = scrollV;
            document.body.scrollLeft = scrollH;
        }
    }
}

// After anchor (hash part of location) changed loads specified post
function gotoAnchoredForumPage() {
    if (!checkIfForum() || !scpperSettings.overrideForum)
        return;
    var postId = location.hash.replace("#", "");
    if (/^#?post-\d+$/.test(postId)) {        
        var post = document.getElementById(postId);
        if (!post) {
            injectScript("scpperForumLoadPostOverride("+postId.replace("post-", "")+");");
        }
    }
    else {
        var currentPage = document.querySelector("#thread-container-posts .pager span.current");
        if (currentPage && (currentPage.innerText != "1"))
            injectScript("scpperForumChangePageHandler(1);");
    }
}

// In case we came here by a link with specific post id we have to wait until correspondent forum page is loaded
// Otherwise go to the first page and process it
function intervalProcessForumPage() {    
    var postId = location.hash.replace("#", "");
    var proc = function() {
        scpForumProcessPosts();    
        scpForumOverridePageHandlers();        
        overrideUserInfoLinks();
        enhanceLinks();        
    };
    // Just in case. Kill interval after 10 iterations
    var killCounter = 0;
    if (/^post-\d+$/.test(postId)) {
        var interval = setInterval(function() {
            var post = document.getElementById(postId);
            if (post || (killCounter >= 10)) {
                proc();
                clearInterval(interval);
            }
        killCounter++;        
        }, 1000)
    }
    else
        proc();
}

// Process a forum page upon loading (runs only once)
function processForumPage() {        
    intervalProcessForumPage();
    if (scpperSettings.overrideForum)
        window.addEventListener("hashchange", gotoAnchoredForumPage);
}

// Listen to messages from forum page
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.text == "FORUM_POSTS_UPDATED_INTERNAL")
        {
            scpForumProcessPosts();
            scpForumOverridePageHandlers();
            overrideUserInfoLinks();
            enhanceLinks();
            setForumPostAnchor();
        }
    }
);
