# Opp-Send Extension Spike

A local Chrome Manifest V3 prototype for the first Opp-Send capture loop:

1. Click the toolbar creature on a job listing.
2. Extract likely job data from the active tab.
3. Review and correct the fields.
4. See a preliminary, transparent nutrition score.
5. Select a resume variant.
6. Save the opportunity locally.

Nothing is uploaded. There is no account, backend, AI model, or automatic form submission in this spike.

Version 0.2 opens as a persistent Chrome side panel and separates listing quality from personal fit. Personal fit remains unscored until the user saves target titles, keywords, location preferences, salary minimum, or resume evidence.

Version 0.2.1 grants explicit access to LinkedIn pages because a persistent side panel does not reliably retain the temporary `activeTab` grant used by a short-lived popup.

Version 0.2.2 scopes LinkedIn extraction to the selected job-detail pane. It no longer uses the entire page body as a description fallback because LinkedIn search pages contain dozens of neighboring jobs, navigation text, and promotional debris.

## Install locally

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this `opp-send-extension` folder.
5. Pin **Opp-Send: Opportunity Eater** to the toolbar.
6. Click it to open the large side panel.
7. Configure **Fit profile**, then open a public job listing and inspect it.

After changing the files, return to `chrome://extensions` and click the extension's reload button.

## Test targets

Start with:

- One LinkedIn job listing.
- One job page using `JobPosting` JSON-LD.
- One generic company careers page without structured job data.

For each page, check title, company, location, salary, URL, and description. The confirmation form is intentionally editable because extraction will never be perfect across every site.

## Current scoring

The extension now displays two deliberately simple local estimates:

- **Listing quality** rewards visible, concrete information and flags a few obvious patterns.
- **Personal fit** compares the listing with the locally saved fit profile.

Neither is a company reputation score, AI judgment, or verified recommendation.

The real investigation system will later need sourced evidence, timestamps, confidence, authorization for third-party data, and human-readable explanations.

## Next engineering milestones

1. Add fixtures and site-specific extractors only where generic extraction fails.
2. Connect authenticated Opp-Send storage.
3. Replace hard-coded resume options with Creature Domain data.
4. Build evidence-backed Opportunity Nutrition.
5. Add copy helpers before attempting arbitrary form autofill.
6. Add Firefox support after the Chrome workflow is stable.
