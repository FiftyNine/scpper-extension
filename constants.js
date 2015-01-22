var MAX_SCP_NUMBER = 3000;
var SCP_NAME_CACHE_EXPIRATION = 1000*60*60*24; // Milliseconds in a day

// List of all supported SCP websites and their properties
// Names must be unique!
// Templates should be checked from last to first
var SCP_WEBSITES = [
	{name: "English", 
	primaryLink: "http://www.scp-wiki.net",
	linkTemplates: ["(www\\.)?scp-wiki\\.net", "(www\\.)?scp-wiki\\.wikidot\\.com"],
	checkTags: true,
	permittedTags: ["scp", "tale", "supplement"],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],	
	membersPages: "/members-pages",
	articleTemplates: [
		{kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3"]},		
		{kind: "ARC", strictRegEx: "SCP-\\d{3,4}-ARC", laxRegEx: "(SCP-)?\\d{3,4}-ARC", numberRegEx: "\\d{3,4}-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps"]},
		{kind: "EX", strictRegEx: "SCP-\\d{3,4}-EX", laxRegEx: "(SCP-)?\\d{3,4}-EX", numberRegEx: "\\d{3,4}-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
//		{kind: "D", strictRegEx: "SCP-\\d{3,4}-D", laxRegEx: "(SCP-)?\\d{3,4}-D", numberRegEx: "\\d{3,4}-D", urlTemplate: "/decomm:SCP-@", listPages: ["/decommissioned-scps"]},
		{kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps"]}]
	},
	{name: "Russian",
	primaryLink: "http://scpfoundation.ru",
	linkTemplates: ["(www\\.)?scpfoundation\\.ru", "(www\\.)?scp-ru\\.wikidot\\.com"],
	checkTags: false,
	permittedTags: [],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK", "RIMG"],
	membersPages: null,
	articleTemplates: [
		{kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(RU|ARC|V|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(RU|ARC|V|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-list", "/scp-list-2", "/scp-list-3"]},
		{kind: "RU", strictRegEx: "SCP-\\d{3,4}-RU(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-RU(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-RU", urlTemplate: "/SCP-@", listPages: ["/scp-list-ru"]},
		{kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-RU)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-RU)?-ARC", numberRegEx: "\\d{3,4}(-RU)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archive"]},
		{kind: "V", strictRegEx: "SCP-\\d{3,4}-V", laxRegEx: "(SCP-)?\\d{3,4}-V", numberRegEx: "\\d{3,4}-V", urlTemplate: "/SCP-@", listPages: ["/archive"]},
		{kind: "EX", strictRegEx: "SCP-\\d{3,4}(-RU)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-RU)?-EX", numberRegEx: "\\d{3,4}(-RU)?-EX", urlTemplate: "/SCP-@", listPages: ["/archive"]},
		{kind: "D", strictRegEx: "SCP-\\d{3,4}(-RU)?-D", laxRegEx: "(SCP-)?\\d{3,4}(-RU)?-D", numberRegEx: "\\d{3,4}(-RU)?-D", urlTemplate: "/decomm:SCP-@", listPages: ["/archive"]},
		{kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/scp-list-j"]}]
	},
	{name: "Korean",
	primaryLink: "http://ko.scp-wiki.net/",
	linkTemplates: ["ko\\.scp-wiki\\.net", "(www\\.)?scp-kr\\.wikidot\\.com"],
	checkTags: false,
	permittedTags: ["SCP", "이야기", "보충"],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
	membersPages: "/members-pages-ko",
	articleTemplates: [
		{kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(KO|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(KO|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3"]},		
		{kind: "KO", strictRegEx: "SCP-\\d{3,4}-KO(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-KO(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-KO", urlTemplate: "/SCP-@", listPages: ["/scp-series-ko"]},
		{kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-KO)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-KO)?-ARC", numberRegEx: "\\d{3,4}(-KO)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps", "/archived-scps-ko"]},
		{kind: "EX", strictRegEx: "SCP-\\d{3,4}(-KO)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-KO)?-EX", numberRegEx: "\\d{3,4}(-KO)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex", "/scp-ko-ex"]},
		{kind: "D", strictRegEx: "SCP-\\d{3,4}(-KO)?-D", laxRegEx: "(SCP-)?\\d{3,4}(-KO)?-D", numberRegEx: "\\d{3,4}(-KO)?-D", urlTemplate: "/decomm:SCP-@", listPages: ["/decommissioned-scps", "/decommissioned-scps-ko"]},
		{kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps", "/joke-scps-ko"]}]
	},	
	{name: "Chinese",
	primaryLink: "http://www.scp-wiki-cn.org/",
	linkTemplates: ["(www\\.)?scp-wiki-cn\\.org"],
	checkTags: false,
	permittedTags: [],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
	membersPages: null,
	articleTemplates: [
		{kind: "MAIN", strictRegEx: "SCP-\\d{3,4}", laxRegEx: "(SCP-)?\\d{3,4}", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-seriess", "/scp-series-2", "/scp-series-3"]}]
	},	
	{name: "French",
	primaryLink: "http://fondationscp.wikidot.com/",
	linkTemplates: ["(www\\.)?fondationscp\\.wikidot\\.com"],
	checkTags: false,
	permittedTags: ["annexe", "scp", "conte"],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
	membersPages: null,
	articleTemplates: [
		{kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(FR|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(FR|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/001-999", "/1000-1999", "/2000-2999"]},
		{kind: "FR", strictRegEx: "SCP-\\d{3,4}-FR(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-FR(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-FR", urlTemplate: "/SCP-@", listPages: ["/liste-francaise"]},
		{kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-FR)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-FR)?-ARC", numberRegEx: "\\d{3,4}(-FR)?-ARC", urlTemplate: "/SCP-@", listPages: ["/scp-archives"]},
		{kind: "EX", strictRegEx: "SCP-\\d{3,4}(-FR)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-FR)?-EX", numberRegEx: "\\d{3,4}(-FR)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex"]},
		{kind: "D", strictRegEx: "SCP-\\d{3,4}(-FR)?-D", laxRegEx: "(SCP-)?\\d{3,4}(-FR)?-D", numberRegEx: "\\d{3,4}(-FR)?-D", urlTemplate: "/SCP-@", listPages: ["/scp-desarme"]},
		{kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/scp-humoristique"]}]
	},	
	{name: "Polish",
	primaryLink: "http://scp-wiki.pl/",
	linkTemplates: ["(www\\.)?scp-wiki\\.pl", "(www\\.)?scp-pl\\.wikidot\\.com"],
	checkTags: false,
	permittedTags: ["opowieść", "scp"],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
	membersPages: null,
	articleTemplates: [
		{kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(PL|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(PL|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/lista-eng", "/lista-eng-2", "/lista-eng-3"]},
		{kind: "PL", strictRegEx: "SCP-PL-\\d{3,4}(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?PL-\\d{3,4}(?!-(ARC|EX|D|J))", numberRegEx: "PL-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/lista-pl"]},
		{kind: "ARC", strictRegEx: "SCP-(PL-)?\\d{3,4}-ARC", laxRegEx: "(SCP-)?(PL-)?\\d{3,4}-ARC", numberRegEx: "(PL-)\\?d{3,4}-ARC", urlTemplate: "/SCP-@", listPages: ["/archiwum"]},
		{kind: "EX", strictRegEx: "SCP-(PL-)?\\d{3,4}-EX", laxRegEx: "(SCP-)?(PL-)?\\d{3,4}-EX", numberRegEx: "(PL-)\\?d{3,4}-EX", urlTemplate: "/SCP-@", listPages: ["/zrozumiane"]},
		{kind: "D", strictRegEx: "SCP-(PL-)?\\d{3,4}-D", laxRegEx: "(SCP-)?(PL-)?\\d{3,4}-D", numberRegEx: "(PL-)\\?d{3,4}-D", urlTemplate: "/decomm:SCP-@", listPages: ["/zlikwidowane"]},
		{kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke"]}]
	},
	{name: "Spanish",
	primaryLink: "http://lafundacionscp.wikidot.com/",
	linkTemplates: ["(www\\.)?lafundacionscp\\.wikidot\\.com"],
	checkTags: false,
	permittedTags: [],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
	membersPages: null,
	articleTemplates: [
		{kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(ES|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(ES|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/serie-scp-i", "/serie-scp-ii", "/serie-scp-iii"]},
		{kind: "ES", strictRegEx: "SCP-ES-\\d{3,4}(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?ES-\\d{3,4}(?!-(ARC|EX|D|J))", numberRegEx: "ES-\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/serie-scp-es"]},
		{kind: "ARC", strictRegEx: "SCP-(ES-)?\\d{3,4}-ARC", laxRegEx: "(SCP-)?(ES-)?\\d{3,4}-ARC", numberRegEx: "(ES-)?\\d{3,4}-ARC", urlTemplate: "/SCP-@", listPages: ["/scps-archivados"]},
		{kind: "EX", strictRegEx: "SCP-(ES-)?\\d{3,4}-EX", laxRegEx: "(SCP-)?(ES-)?\\d{3,4}-EX", numberRegEx: "(ES-)?\\d{3,4}-EX", urlTemplate: "/SCP-@", listPages: ["/scps-exs"]},
		{kind: "D", strictRegEx: "SCP-(ES-)?\\d{3,4}-D", laxRegEx: "(SCP-)?(ES-)?\\d{3,4}-D", numberRegEx: "(ES-)?\\d{3,4}-D", urlTemplate: "/decomm:SCP-@", listPages: ["/scps-desmantelados"]},
		{kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/scps-humoristicos"]}]
	},
	{name: "Thai",
	primaryLink: "http://scp-th.wikidot.com/",
	linkTemplates: ["(www\\.)?scp-th\\.wikidot\\.com"],
	checkTags: false,
	permittedTags: [],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
	membersPages: null,
	articleTemplates: [
		{kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(TH|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(TH|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series-1", "/scp-series-2", "/scp-series-3"]},
		{kind: "TH", strictRegEx: "SCP-\\d{3,4}-TH(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-TH(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-TH", urlTemplate: "/SCP-@", listPages: ["/scp-series-th"]},
		{kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-TH)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-TH)?-ARC", numberRegEx: "\\d{3,4}(-TH)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps", "/archived-scps-th"]},
		{kind: "EX", strictRegEx: "SCP-\\d{3,4}(-TH)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-TH)?-EX", numberRegEx: "\\d{3,4}(-TH)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex", "/scp-th-ex"]},
		{kind: "D", strictRegEx: "SCP-\\d{3,4}(-TH)?-D", laxRegEx: "(SCP-)?\\d{3,4}(-TH)?-D", numberRegEx: "\\d{3,4}(-TH)?-D", urlTemplate: "/SCP-@", listPages: ["/decommissioned-scps", "/decommissioned-scps-th"]},
		{kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps", "/joke-scps-th"]}]
	},
	{name: "Japanese",
	primaryLink: "http://ja.scp-wiki.net/",
	linkTemplates: ["ja\\.scp-wiki\\.net", "(www\\.)?scp-jp\\.wikidot\\.com"],
	checkTags: false,
	permittedTags: [],
	ignoreElements: ["PAGE-RATE-WIDGET-BOX", "SCP-IMAGE-BLOCK"],
	membersPages: "/members-pages-jp",
	articleTemplates: [
		{kind: "MAIN", strictRegEx: "SCP-\\d{3,4}(?!-(JP|ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}(?!-(JP|ARC|EX|D|J))", numberRegEx: "\\d{3,4}", urlTemplate: "/SCP-@", listPages: ["/scp-series", "/scp-series-2", "/scp-series-3"]},
		{kind: "JP", strictRegEx: "SCP-\\d{3,4}-JP(?!-(ARC|EX|D|J))", laxRegEx: "(SCP-)?\\d{3,4}-JP(?!-(ARC|EX|D|J))", numberRegEx: "\\d{3,4}-JP", urlTemplate: "/SCP-@", listPages: ["/scp-series-jp"]},
		{kind: "ARC", strictRegEx: "SCP-\\d{3,4}(-JP)?-ARC", laxRegEx: "(SCP-)?\\d{3,4}(-JP)?-ARC", numberRegEx: "\\d{3,4}(-JP)?-ARC", urlTemplate: "/SCP-@", listPages: ["/archived-scps", "/archived-scps-jp"]},
		{kind: "EX", strictRegEx: "SCP-\\d{3,4}(-JP)?-EX", laxRegEx: "(SCP-)?\\d{3,4}(-JP)?-EX", numberRegEx: "\\d{3,4}(-JP)?-EX", urlTemplate: "/SCP-@", listPages: ["/scp-ex", "/scp-jp-ex"]},
		{kind: "D", strictRegEx: "SCP-\\d{3,4}(-JP)?-D", laxRegEx: "(SCP-)?\\d{3,4}(-JP)?-D", numberRegEx: "\\d{3,4}(-JP)?-D", urlTemplate: "/decomm:SCP-@", listPages: ["/decommissioned-scps", "/decommissioned-scps-jp"]},
		{kind: "J", strictRegEx: "SCP-[\\w-]+-J", laxRegEx: "(SCP-)?[\\w-]+-J", numberRegEx: "\\b(?!SCP)\\w+[\\w-]*-J", urlTemplate: "/SCP-@", listPages: ["/joke-scps", "/joke-scps-jp"]}]
	}				
];

// Default extensions settings used on first launch or after updated to a newer version
var scpperDefaultSettings = {
	useLinkifier: true,
	linkifierTemplate: "smart",
	addAuthorPage: true,
	addArticleName: true,
	overrideForum: true,
	linkTooltips: true
};