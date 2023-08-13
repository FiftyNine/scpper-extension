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

//Runs after coming to a new page, set anchor by the first post of the page
function setForumPostAnchor() {
    if (!scpperSettings.overrideForum)
        return;
    // Ignore this if we already have a current post
    var postId = location.hash.replace("#", "");
    var currentPost = document.getElementById(postId);
    if (currentPost)
        return;
    // Otherwise remember current page in hash part of the url
    var currentPage = document.querySelector("#thread-container-posts .pager span.current");
    if (currentPage && (currentPage.innerText != "1")) {
        location.hash = "#page-" + currentPage.innerText;
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
    var hash = location.hash.replace("#", "");
    if (/^#?post-\d+$/.test(hash)) {
        var post = document.getElementById(hash);
        if (!post) {
            var postNumber = hash.replace("post-", "");
            var detail = {text: 'LOAD_FORUM_POST', postId: postNumber};
            sendMessageToPage(detail);
        }
    } else {
        var currentPage = document.querySelector("#thread-container-posts .pager span.current");
        if (!currentPage)
            return;
        if (/^#?page-\d+$/.test(hash)) {
            if (hash != "page-"+currentPage.innerText) {
                var pageNumber = hash.replace("page-", "");
                var detail = {text: 'LOAD_FORUM_PAGE', page: pageNumber};
                sendMessageToPage(detail);
            }
        } else if (currentPage.innerText != "1") {
            var detail = {text: 'LOAD_FORUM_PAGE', page: 1};
            sendMessageToPage(detail);
        }
    }
}

// Show current post or scroll to the top of the thread if none
function scrollToCurrentLocation() {
    if (!scpperSettings.overrideForum)
        return;
    var postId = location.hash.replace("#", "");
    var currentPost = document.getElementById(postId);
    if (currentPost) {
        currentPost.scrollIntoView(true);
    } else {
        document.getElementById("thread-container").scrollIntoView(true);
    }
}

// Process a forum page upon loading (runs only once)
function processForumPage() {
    if (scpperSettings.overrideForum)
        window.addEventListener("hashchange", gotoAnchoredForumPage);
}

// Listen to messages from forum page
document.addEventListener('ScpperExternalMessage', function(event) {
    if (event.detail.text == "FORUM_POSTS_UPDATED_EXTERNAL") {
        scpForumProcessPosts();
        enhanceLinks();
        scrollToCurrentLocation();
        setForumPostAnchor();
    }
});