chrome.tabs.query({ active:true, currentWindow:true }, function(tabs) {
  const currentTabUrl = tabs[0].url;
  console.log('currentTabUrl', currentTabUrl);
  chrome.declarativeContent.onPageChanged.getRules(async (rules) => {
    const noticesIds = rules.filter(
        ({ conditions }) =>
            conditions
                .map(c => c?.pageUrl?.urlMatches)
                .filter(urlMatches => urlMatches)
                .some(urlMatches => currentTabUrl.match(urlMatches))
    ).map(({ id }) => id);

    const notices = await Promise.all(
        noticesIds
            .map(noticeId => fetch(`https://notices.bulles.fr/api/v3/notices/${noticeId}`).then(response => response.json()))
    )
    console.log(notices);
    document.write(notices.map(({ message }) => message).join('<br />'));
  });
});
