const createUrlMatchesPageStateMatcher = (urlMatches) =>
  new chrome.declarativeContent.PageStateMatcher({
    pageUrl: { urlMatches },
  });

const createSetIconAction = (path) =>
  new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0, 19, 19);
        const imageData = ctx.getImageData(0, 0, 19, 19);
        const action = new chrome.declarativeContent.SetIcon({ imageData });

        return resolve(action);
      };
      image.src = chrome.runtime.getURL(path);
    } catch (e) {
      reject(e);
    }
  });

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, async () => {
    const matchingContexts = await fetch(
      'https://notices.bulles.fr/api/v3/matching-contexts'
    ).then((response) => response.json());
    const showPageAction = new chrome.declarativeContent.ShowPageAction();
    const setIconAction = await createSetIconAction('logo.png');
    const rules = Object.values(
      matchingContexts
        .filter((mc) => !mc.urlRegex.includes('?='))
        .reduce((rules, mc) => {
          rules[mc.noticeId.toString()] = {
            id: mc.noticeId.toString(),
            ...(rules[mc.noticeId] || {}),
            conditions: [
              ...(rules[mc.noticeId.toString()]?.conditions || []),
              createUrlMatchesPageStateMatcher(mc.urlRegex),
            ],
            actions: [showPageAction, setIconAction],
          };

          return rules;
        }, {})
    );
    chrome.declarativeContent.onPageChanged.addRules(rules);
  });
});
