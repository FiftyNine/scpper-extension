var MAX_SCP_NUMBER = 4000;
var SCP_NAME_CACHE_EXPIRATION = 1000*60*60*24; // Milliseconds in a day

// List of all supported SCP websites and their properties
// Names must be unique!
// Templates should be checked from last to first
var SCP_WEBSITES = [
    {name: "English",
    protocol: "https",
    primaryLink: "https://www.scpwiki.com",
    linkTemplates: ["(www\\.)?scpwiki\\.com", "(www\\.)?scp-wiki\\.net", "(www\\.)?scp-wiki\\.wikidot\\.com"],
    checkTags: true,
    permittedTags: ["scp", "tale", "supplement"],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],    
    membersPages: ["/members-pages"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "ARC", strictRegEx: "SCP-\\d{3,4}-ARC", laxRegEx: "(SCP-)?\\d{3,4}-ARC", numberRegEx: "\\d{3,4}-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}-EX", laxRegEx: "(SCP-)?\\d{3,4}-EX", numberRegEx: "\\d{3,4}-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
//        {kind: "D", strictRegEx: "SCP-\\d{3,4}-D", laxRegEx: "(SCP-)?\\d{3,4}-D", numberRegEx: "\\d{3,4}-D", urlTemplate: "/decomm:SCP-@", listPages: ["/decommissioned-scps"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps"]}]
    },
    {name: "Russian",
    protocol: "http",
    primaryLink: "http://scpfoundation.net",
    linkTemplates: ["(www\\.)?scpfoundation\\.ru", "(www\\.)?scp-ru\\.wikidot\\.com", "(www\\.)?scpfoundation\\.net"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK", "RIMG"],
    membersPages: null,
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(RU|ARC|V|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(RU|ARC|V|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "RU", strictRegEx: "SCP-\\d{3,4}-RU(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-RU(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-RU", urlTemplate: "/SCP-@", listPages: ["/scp-list-ru"]},
        {kind: "FR", strictRegEx: "SCP-\\d{3,4}-FR(-J)?", laxRegEx: "(SCP-)?\\d{3,4}-FR(-J)?", numberRegEx: "\\d{3,4}-FR(-J)?", urlTemplate: "/SCP-@", listPages: ["/scp-list-fr"]},
        {kind: "JP", strictRegEx: "SCP-\\d{3,4}-JP(-J)?", laxRegEx: "(SCP-)?\\d{3,4}-JP(-J)?", numberRegEx: "\\d{3,4}-JP(-J)?", urlTemplate: "/SCP-@", listPages: ["/scp-list-jp"]},
        {kind: "ES", strictRegEx: "SCP-\\d{3,4}-ES(-J)?", laxRegEx: "(SCP-)?\\d{3,4}-ES(-J)?", numberRegEx: "\\d{3,4}-ES(-J)?", urlTemplate: "/SCP-@", listPages: ["/scp-list-es"]},
        {kind: "PL", strictRegEx: "SCP-\\d{3,4}-PL(-J)?", laxRegEx: "(SCP-)?\\d{3,4}-PL(-J)?", numberRegEx: "\\d{3,4}-PL(-J)?", urlTemplate: "/SCP-@", listPages: ["/scp-list-pl"]},
        {kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-RU)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-RU)?-ARC", numberRegEx: "\\d{3,4}(-RU)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archive"]},
        {kind: "V", strictRegEx: "SCP-\\d{3,4}-V", laxRegEx: "(SCP-)?\\d{3,4}-V", numberRegEx: "\\d{3,4}-V", urlTemplate: "/SCP-@", listPages: ["/archive"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}(-RU)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-RU)?-EX", numberRegEx: "\\d{3,4}(-RU)?-EX", urlTemplate: "/SCP-@", listPages: ["/archive"]},
        {kind: "D", strictRegEx: "SCP-\\d{3,4}(-RU)?-D", laxRegEx: "(SCP-)?\\d{3,4}(-RU)?-D", numberRegEx: "\\d{3,4}(-RU)?-D", urlTemplate: "/decomm:SCP-@", listPages: ["/archive"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/scp-list-j"]}]
    },
    {name: "Korean",
    protocol: "http",
    primaryLink: "http://ko.scp-wiki.net",
    linkTemplates: ["ko\\.scp-wiki\\.net", "(www\\.)?scpko\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: ["SCP", "이야기", "보충"],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: ["/members-pages-ko", "/members-pages"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(KO|ARC|EX|D|J|JP))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(KO|ARC|EX|D|J|JP))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "KO", strictRegEx: "SCP-\\d{3,4}-KO(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-KO(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-KO", urlTemplate: "/SCP-@", listPages: ["/scp-series-ko"]},
        {kind: "JP", strictRegEx: "SCP-\\d{3,4}-JP(-J)?", laxRegEx: "(SCP-)?\\d{3,4}-JP(-J)?", numberRegEx: "\\d{3,4}-JP(-J)?", urlTemplate: "/SCP-@", listPages: ["/scp-series-jp"]},
        {kind: "CN", strictRegEx: "SCP-CN-\\d{3,4}", laxRegEx: "(SCP-)?CN-\\d{3,4}", numberRegEx: "CN-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series-cn"]},
        {kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-KO)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-KO)?-ARC", numberRegEx: "\\d{3,4}(-KO)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps", "/archived-scps-ko"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}(-KO)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-KO)?-EX", numberRegEx: "\\d{3,4}(-KO)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex", "/scp-ko-ex"]},
        {kind: "DEL", strictRegEx: "SCP-\\d{3,4}(-KO)?-DEL", laxRegEx: "(SCP-)?\\d{3,4}(-KO)?-DEL", numberRegEx: "\\d{3,4}(-KO)?-DEL", urlTemplate: "/deleted:SCP-@", listPages: ["/deleted-scps"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps", "/joke-scps-ko"]}]
    },
    {name: "Chinese",
    protocol: "https",
    primaryLink: "https://scp-wiki-cn.wikidot.com",
    linkTemplates: ["(www\\.)?scp-wiki-cn\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: ["/members-pages", "/members-pages-cn"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(ARC|EX|D|J|CN))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(ARC|EX|D|J|CN))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "CN", strictRegEx: "SCP-CN-\\d{3,4}(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)CN-?\\d{3,4}(?!-(ARC|EX|D|J))", numberRegEx: "CN-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series-cn", "/scp-series-cn-2", "/scp-series-cn-3"]},
        {kind: "ARC", strictRegEx: "SCP-(CN-)?\\d{3,4}-ARC", laxRegEx: "(SCP-)?(CN-)?\\d{3,4}-ARC", numberRegEx: "(CN-)?\\d{3,4}-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps"]},
        {kind: "EX", strictRegEx: "SCP-(CN-)?\\d{3,4}-EX", laxRegEx: "(SCP-)?(CN-)?\\d{3,4}-EX", numberRegEx: "(CN-)?\\d{3,4}-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
        {kind: "D", strictRegEx: "SCP-(CN-)?\\d{3,4}-D", laxRegEx: "(SCP-)?(CN-)?\\d{3,4}-D", numberRegEx: "(CN-)?\\d{3,4}-D", urlTemplate: "/SCP-@", listPages: ["/decommissioned-scps"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps", "/joke-scps-cn"]}]
    },
    {name: "French",
    protocol: "http",
    primaryLink: "http://fondationscp.wikidot.com",
    linkTemplates: ["(www\\.)?fondationscp\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: ["annexe", "scp", "conte"],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: null,
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(FR|ARC|EX|D|J|JP))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(FR|ARC|EX|D|J|JP))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "FR", strictRegEx: "SCP-\\d{3,4}-FR(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-FR(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-FR", urlTemplate: "/SCP-@", listPages: ["/liste-francaise"]},
        {kind: "JP", strictRegEx: "SCP-\\d{3,4}-JP", laxRegEx: "(SCP-)?\\d{3,4}-JP", numberRegEx: "\\d{3,4}-JP", urlTemplate: "/SCP-@", listPages: ["/liste-japonaise"]},
        {kind: "ES", strictRegEx: "SCP-\\d{3,4}-ES", laxRegEx: "(SCP-)?\\d{3,4}-ES", numberRegEx: "\\d{3,4}-ES", urlTemplate: "/SCP-@", listPages: ["/liste-espagnole"]},
        {kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-FR)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-FR)?-ARC", numberRegEx: "\\d{3,4}(-FR)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}(-FR)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-FR)?-EX", numberRegEx: "\\d{3,4}(-FR)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
        {kind: "D", strictRegEx: "SCP-\\d{3,4}(-FR)?-D", laxRegEx: "(SCP-)?\\d{3,4}(-FR)?-D", numberRegEx: "\\d{3,4}(-FR)?-D", urlTemplate: "/SCP-@", listPages: ["/scp-desarme"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps", "/scps-humoristique-francais"]}]
    },    
    {name: "Polish",
    protocol: "http",
    primaryLink: "http://scp-wiki.net.pl",
    linkTemplates: ["(www\\.)?scp-wiki\\.net\\.pl", "(www\\.)?scp-pl\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: ["opowieść", "scp"],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: ["/authors-pages"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(PL|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(PL|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "PL", strictRegEx: "SCP-PL-\\d{3,4}(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?PL-\\d{3,4}(?!-(ARC|EX|D|J))", numberRegEx: "PL-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/lista-pl"]},
        {kind: "ARC", strictRegEx: "SCP-(PL-)?\\d{3,4}-ARC", laxRegEx: "(SCP-)?(PL-)?\\d{3,4}-ARC", numberRegEx: "(PL-)?\\d{3,4}-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps", "/archived-scps-pl"]},
        {kind: "EX", strictRegEx: "SCP-(PL-)?\\d{3,4}-EX", laxRegEx: "(SCP-)?(PL-)?\\d{3,4}-EX", numberRegEx: "(PL-)?\\d{3,4}-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
        {kind: "D", strictRegEx: "SCP-(PL-)?\\d{3,4}-D", laxRegEx: "(SCP-)?(PL-)?\\d{3,4}-D", numberRegEx: "(PL-)?\\d{3,4}-D", urlTemplate: "/decomm:SCP-@", listPages: ["/zlikwidowane"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps", "/joke-scps-pl"]}]
    },
    {name: "Spanish",
    protocol: "http",
    primaryLink: "http://scp-es.com",
    linkTemplates: ["(www\\.)?lafundacionscp\\.wikidot\\.com", "(www\\.)?scp-es\\.com"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: null,
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(ES|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(ES|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "ES", strictRegEx: "SCP-ES-\\d{3,4}(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?ES-\\d{3,4}(?!-(ARC|EX|D|J))", numberRegEx: "ES-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/serie-scp-es", "/serie-scp-es-2", "/serie-scp-es-3"]},
        {kind: "ARC", strictRegEx: "SCP-(ES-)?\\d{3,4}-ARC", laxRegEx: "(SCP-)?(ES-)?\\d{3,4}-ARC", numberRegEx: "(ES-)?\\d{3,4}-ARC", urlTemplate: "/SCP-@", listPages: ["/scps-archivados"]},
        {kind: "EX", strictRegEx: "SCP-(ES-)?\\d{3,4}-EX", laxRegEx: "(SCP-)?(ES-)?\\d{3,4}-EX", numberRegEx: "(ES-)?\\d{3,4}-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
        {kind: "D", strictRegEx: "SCP-(ES-)?\\d{3,4}-D", laxRegEx: "(SCP-)?(ES-)?\\d{3,4}-D", numberRegEx: "(ES-)?\\d{3,4}-D", urlTemplate: "/decomm:SCP-@", listPages: ["/scps-desmantelados"]},
        {kind: "VO", strictRegEx: "SCP-(ES-)?\\d{3,4}-VO", laxRegEx: "(SCP-)?(ES-)?\\d{3,4}-VO", numberRegEx: "(ES-)?\\d{3,4}-VO", urlTemplate: "/SCP-@", listPages: ["/scps-vos"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps"]}]
    },
    {name: "Thai",
    protocol: "http",
    primaryLink: "http://scp-th.wikidot.com",
    linkTemplates: ["(www\\.)?scp-th\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: ["/members-pages"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(TH|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(TH|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series-1", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6"]},
        {kind: "TH", strictRegEx: "SCP-\\d{3,4}-TH(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-TH(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-TH", urlTemplate: "/SCP-@", listPages: ["/scp-series-th"]},
        {kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-TH)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-TH)?-ARC", numberRegEx: "\\d{3,4}(-TH)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps", "/archived-scps-th"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}(-TH)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-TH)?-EX", numberRegEx: "\\d{3,4}(-TH)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex", "/scp-th-ex"]},
        {kind: "D", strictRegEx: "SCP-\\d{3,4}(-TH)?-D", laxRegEx: "(SCP-)?\\d{3,4}(-TH)?-D", numberRegEx: "\\d{3,4}(-TH)?-D", urlTemplate: "/SCP-@", listPages: ["/decommissioned-scps", "/decommissioned-scps-th"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps", "/joke-scps-th"]}]
    },
    {name: "Japanese",
    protocol: "http",
    primaryLink: "http://ja.scp-wiki.net",
    linkTemplates: ["ja\\.scp-wiki\\.net", "(www\\.)?scp-jp\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: ["/members-pages-jp", "/members-pages"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(JP|ARC|EX|D|J|KO))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(JP|ARC|EX|D|J|KO))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "JP", strictRegEx: "SCP-\\d{3,4}-JP(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-JP(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-JP", urlTemplate: "/SCP-@", listPages: ["/scp-series-jp", "/scp-series-jp-2", "/scp-series-jp-3"]},
        {kind: "KO", strictRegEx: "SCP-\\d{3,4}-KO", laxRegEx: "(SCP-)?\\d{3,4}-KO", numberRegEx: "\\d{3,4}-KO", urlTemplate: "/SCP-@", listPages: ["/scp-series-ko"]},
        {kind: "RU", strictRegEx: "SCP-\\d{3,4}-RU", laxRegEx: "(SCP-)?\\d{3,4}-RU", numberRegEx: "\\d{3,4}-RU", urlTemplate: "/SCP-@", listPages: ["/scp-list-ru"]},
        {kind: "CN", strictRegEx: "SCP-CN-\\d{3,4}", laxRegEx: "(SCP-)?CN-\\d{3,4}", numberRegEx: "CN-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series-cn", "/scp-series-cn-2", "/scp-series-cn-3"]},
        {kind: "FR", strictRegEx: "SCP-\\d{3,4}-FR", laxRegEx: "(SCP-)?\\d{3,4}-FR", numberRegEx: "\\d{3,4}-FR", urlTemplate: "/SCP-@", listPages: ["/liste-francaise"]},
        {kind: "PL", strictRegEx: "SCP-PL-\\d{3,4}", laxRegEx: "(SCP-)PL-?\\d{3,4}", numberRegEx: "PL-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/lista-pl"]},
        {kind: "ES", strictRegEx: "SCP-ES-\\d{3,4}", laxRegEx: "(SCP-)ES-?\\d{3,4}", numberRegEx: "ES-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/serie-scp-es"]},
        {kind: "TH", strictRegEx: "SCP-\\d{3,4}-TH", laxRegEx: "(SCP-)?\\d{3,4}-TH", numberRegEx: "\\d{3,4}-TH", urlTemplate: "/SCP-@", listPages: ["/scp-series-th"]},
        {kind: "DE", strictRegEx: "SCP-\\d{3,4}-DE", laxRegEx: "(SCP-)?\\d{3,4}-DE", numberRegEx: "\\d{3,4}-DE", urlTemplate: "/SCP-@", listPages: ["/scp-de"]},
        {kind: "IT", strictRegEx: "SCP-\\d{3,4}-IT", laxRegEx: "(SCP-)?\\d{3,4}-IT", numberRegEx: "\\d{3,4}-IT", urlTemplate: "/SCP-@", listPages: ["/scp-it-serie-i"]},
        {kind: "UA", strictRegEx: "SCP-\\d{3,4}-UA", laxRegEx: "(SCP-)?\\d{3,4}-UA", numberRegEx: "\\d{3,4}-UA", urlTemplate: "/SCP-@", listPages: ["/scp-series-ua"]},
        {kind: "PT", strictRegEx: "SCP-\\d{3,4}-PT", laxRegEx: "(SCP-)?\\d{3,4}-PT", numberRegEx: "\\d{3,4}-PT", urlTemplate: "/SCP-@", listPages: ["/series-1-pt"]},
        {kind: "CS", strictRegEx: "SCP-\\d{3,4}-CS", laxRegEx: "(SCP-)?\\d{3,4}-CS", numberRegEx: "\\d{3,4}-CS", urlTemplate: "/SCP-@", listPages: ["/scp-series-cs"]},
        {kind: "KO", strictRegEx: "SCP-ZH-\\d{3,4}", laxRegEx: "(SCP-)?ZH-\\d{3,4}", numberRegEx: "ZH-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series-zh"]},
        {kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-JP)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-JP)?-ARC", numberRegEx: "\\d{3,4}(-JP)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps", "/archived-scps-jp"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}(-JP)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-JP)?-EX", numberRegEx: "\\d{3,4}(-JP)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex", "/scp-jp-ex"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps", "/joke-scps-jp"]}]
    },
    {name: "German",
    protocol: "http",
    primaryLink: "http://scp-wiki-de.wikidot.com",
    linkTemplates: ["(www\\.)?scp-wiki-de\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: ["/members-pages"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(DE|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(DE|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "DE", strictRegEx: "SCP-\\d{3,4}-DE(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-DE(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-DE", urlTemplate: "/SCP-@", listPages: ["/scp-serie-de"]},
        {kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-DE)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-DE)?-ARC", numberRegEx: "\\d{3,4}(-DE)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}(-DE)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-DE)?-EX", numberRegEx: "\\d{3,4}(-DE)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps"]}]
    },
    {name: "Italian",
    protocol: "http",
    primaryLink: "http://fondazionescp.wikidot.com",
    linkTemplates: ["(www\\.)?fondazionescp\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: ["/authors-pages"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(IT|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(IT|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6"]},
        {kind: "IT", strictRegEx: "SCP-\\d{3,4}-IT(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-IT(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-IT", urlTemplate: "/SCP-@", listPages: ["/scp-it-serie-i"]},
        {kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-IT)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-IT)?-ARC", numberRegEx: "\\d{3,4}(-IT)?-ARC", urlTemplate: "/SCP-@", listPages: ["/scp-archiviati"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}(-IT)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-IT)?-EX", numberRegEx: "\\d{3,4}(-IT)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-risolti"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/scp-scherzo"]}]
    },
    {name: "Ukrainian",
    protocol: "http",
    primaryLink: "http://scp-ukrainian.wikidot.com",
    linkTemplates: ["(www\\.)?scp-ukrainian\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: null,
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(UA|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(UA|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "UA", strictRegEx: "SCP-\\d{3,4}-UA(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-UA(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-UA", urlTemplate: "/SCP-@", listPages: ["/scp-series-ua"]},
        {kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-UA)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-UA)?-ARC", numberRegEx: "\\d{3,4}(-UA)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archive"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}(-UA)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-UA)?-EX", numberRegEx: "\\d{3,4}(-UA)?-EX", urlTemplate: "/SCP-@", listPages: ["/explained-list"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/scp-list-j"]}]
    },
    {name: "Portuguese",
    protocol: "http",
    primaryLink: "http://scp-pt-br.wikidot.com",
    linkTemplates: ["(www\\.)?scp-pt-br\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: ["/pessoal"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(PT|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(PT|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6"]},
        {kind: "PT", strictRegEx: "SCP-\\d{3,4}-PT(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-PT(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-PT", urlTemplate: "/SCP-@", listPages: ["/series-1-pt", "/series-2-pt"]},
        {kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-PT)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-PT)?-ARC", numberRegEx: "\\d{3,4}(-PT)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}(-PT)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-PT)?-EX", numberRegEx: "\\d{3,4}(-PT)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps"]}]
    },
    {name: "Czech", 
    protocol: "http",
    primaryLink: "http://scp-cs.wikidot.com",
    linkTemplates: ["(www\\.)?scp-cs\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],    
    membersPages: ["/authors-pages", "/translators-pages"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "CS", strictRegEx: "SCP-\\d{3,4}-CS(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-CS(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-CS", urlTemplate: "/SCP-@", listPages: ["/scp-series-cs"]},
        {kind: "SK", strictRegEx: "SCP-\\d{3,4}-SK(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-SK(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-SK", urlTemplate: "/SCP-@", listPages: ["/scp-series-sk"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}-EX", laxRegEx: "(SCP-)?\\d{3,4}-EX", numberRegEx: "\\d{3,4}-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps"]}]
    },
    {name: "TraditionalChinese",
    protocol: "http",
    primaryLink: "http://scp-zh-tr.wikidot.com",
    linkTemplates: ["(www\\.)?scp-zh-tr\\.wikidot\\.com"],
    checkTags: false,
    permittedTags: [],
    ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
    membersPages: ["/authors-pages"],
    articleTemplates: [
        {kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3", "/scp-series-4", "/scp-series-5", "/scp-series-6", "/scp-series-7"]},
        {kind: "ZH", strictRegEx: "SCP-ZH-\\d{3,4}(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?ZH-\\d{3,4}(?!-(ARC|EX|D|J))", numberRegEx: "ZH-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series-zh"]},
        {kind: "JP", strictRegEx: "SCP-\\d{3,4}-JP(-J)?", laxRegEx: "(SCP-)?\\d{3,4}-JP(-J)?", numberRegEx: "\\d{3,4}-JP(-J)?", urlTemplate: "/SCP-@", listPages: ["/scp-series-jp"]},
        {kind: "EX", strictRegEx: "SCP-\\d{3,4}-EX", laxRegEx: "(SCP-)?\\d{3,4}-EX", numberRegEx: "\\d{3,4}-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
        {kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps"]}]
    }
];

// Default extensions settings used on first launch or after updated to a newer version
var scpperDefaultSettings = {
    useLinkifier: true,
    linkifierTemplate: "smart",
    addAuthorPage: true,
    addArticleName: true,
    addPageInfo: true,
    overrideForum: true,
    linkTooltips: true
};
