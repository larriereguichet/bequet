// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const mcBlacklist = ['Moscow', 'moscow'];


const createUrlMatchesPageStateMatcher = (urlMatches) => new chrome.declarativeContent.PageStateMatcher({
  pageUrl: { urlMatches },
})

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {

  chrome.pageAction.onClicked.addListener(function(tab) {
    // No tabs or host permissions needed!
    console.log('Turning ' + tab.url + ' red!');
  });

  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, async function() {
    // With a new rule ...
    const matchingContexts = await fetch('https://notices.bulles.fr/api/v3/matching-contexts').then(response => response.json())

    const showPageAction = new chrome.declarativeContent.ShowPageAction();
    const rules = Object.values(matchingContexts.filter(mc => !mc.urlRegex.includes('?=')).reduce((rules, mc) => {
        rules[mc.noticeId.toString()] = {
          id: mc.noticeId.toString(),
          ...rules[mc.noticeId] || {},
          conditions: [
            ...rules[mc.noticeId.toString()]?.conditions || [],
            createUrlMatchesPageStateMatcher(mc.urlRegex)
          ],
          actions: [showPageAction],
        }

        return rules;
    }, {}));


    console.log(rules);

    chrome.declarativeContent.onPageChanged.addRules(rules);
  });
});
