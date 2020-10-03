const render = (content) => {
  document.getElementById('app').innerHTML = content;
};

const renderNotices = (notices) =>
  render(
    notices
      .map(({ message, contributor: { name } }) => {
        return `<article>
        ${message}
        <em>${name}</em>
      </article>`;
      })
      .join('<hr />')
  );

const createRuleMatcher = (url) => ({ conditions }) =>
  conditions
    .map((c) => c?.pageUrl?.urlMatches)
    .filter((urlMatches) => urlMatches)
    .some((urlMatches) => url.match(urlMatches));

try {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const ruleMatcher = createRuleMatcher(tabs[0].url);

    chrome.declarativeContent.onPageChanged.getRules(async (rules) => {
      const noticesIds = rules.filter(ruleMatcher).map(({ id }) => id);
      const notices = await Promise.all(
        noticesIds.map((noticeId) =>
          fetch(
            `https://notices.bulles.fr/api/v3/notices/${noticeId}`
          ).then((response) => response.json())
        )
      );
      renderNotices(notices);
    });
  });
} catch (e) {
  console.error(e);
}
