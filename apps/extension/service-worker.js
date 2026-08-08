chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("opportunities").then(({ opportunities }) => {
    if (!Array.isArray(opportunities)) {
      return chrome.storage.local.set({ opportunities: [] });
    }
  });
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(() => {});
