const $ = (id) => document.getElementById(id);

const views = {
  scan: $("scan-view"),
  review: $("review-view"),
  saved: $("saved-view"),
  profile: $("profile-view"),
};

function showView(name) {
  Object.entries(views).forEach(([key, node]) => node.classList.toggle("hidden", key !== name));
  $("error").classList.add("hidden");
  $("hunt-tab").classList.toggle("active", name !== "profile");
  $("profile-tab").classList.toggle("active", name === "profile");
}

function setCreatureCopy(text) {
  $("creature-copy").textContent = text;
}

function showError(message) {
  $("error").textContent = message;
  $("error").classList.remove("hidden");
  setCreatureCopy("The page resists digestion. Cowardly behavior from a document.");
}

function extractJobData() {
  const clean = (value = "") => value.replace(/\s+/g, " ").trim();
  const meta = (name, property = false) => clean(document.querySelector(`meta[${property ? "property" : "name"}="${name}"]`)?.content || "");
  const firstText = (selectors, root = document) => {
    for (const selector of selectors) {
      const node = root.querySelector(selector);
      const value = clean(node?.innerText || node?.textContent || "");
      if (value) return value;
    }
    return "";
  };
  const detailRoot = document.querySelector([
    ".jobs-search__job-details--container",
    ".jobs-search__job-details",
    ".scaffold-layout__detail",
    ".job-view-layout",
    "[data-job-details]"
  ].join(",")) || document;
  const detailText = clean(detailRoot.innerText || "");
  const aboutJobText = () => {
    const headings = [...detailRoot.querySelectorAll("h2,h3")];
    const heading = headings.find((node) => /^about the job$/i.test(clean(node.textContent || "")));
    if (!heading) return "";
    let candidate = heading.parentElement;
    while (candidate && candidate !== detailRoot.parentElement) {
      const value = clean(candidate.innerText || "");
      if (value.length >= 250 && value.length <= 15000) return value.replace(/^About the job\s*/i, "");
      if (candidate === detailRoot) break;
      candidate = candidate.parentElement;
    }
    return "";
  };
  const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((node) => {
    try {
      const value = JSON.parse(node.textContent);
      return Array.isArray(value) ? value : [value];
    } catch { return []; }
  });
  const jobPosting = jsonLd.find((item) => item?.["@type"] === "JobPosting") || {};
  const pageUrl = window.location.href;
  const pageTitle = clean(document.title);
  const linkedInHiringTitle = pageTitle.match(/^(.+?)\s+hiring\s+(.+?)\s+in\s+(.+?)\s*\|\s*LinkedIn/i);
  const linkedInPipeTitle = pageTitle.match(/^(.+?)\s*\|\s*(.+?)\s*\|\s*LinkedIn/i);
  const linkedInTitle = linkedInHiringTitle?.[2] || linkedInPipeTitle?.[1] || "";
  const linkedInCompany = linkedInHiringTitle?.[1] || linkedInPipeTitle?.[2] || "";
  const linkedInLocation = linkedInHiringTitle?.[3] || "";
  const title = clean(jobPosting.title) || firstText([
    ".job-details-jobs-unified-top-card__job-title h1",
    ".jobs-unified-top-card__job-title",
    ".top-card-layout__title",
    "[data-testid*=title]",
    "[class*=job-title]",
    "[class*=jobTitle]",
    "h1"
  ], detailRoot) || clean(linkedInTitle) || clean(pageTitle.split(/[|–—]/)[0]);
  const company = clean(jobPosting.hiringOrganization?.name) || firstText([
    ".job-details-jobs-unified-top-card__company-name a",
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name",
    ".topcard__org-name-link",
    ".top-card-layout__card a[data-tracking-control-name*=company]",
    "[data-testid*=company]",
    "[class*=company-name]",
    "[class*=companyName]",
    "[class*=topcard__org-name]"
  ], detailRoot) || clean(linkedInCompany);
  const jobLocation = clean(jobPosting.jobLocation?.address?.addressLocality) || clean(jobPosting.applicantLocationRequirements?.name) || firstText([
    ".job-details-jobs-unified-top-card__primary-description-container",
    ".jobs-unified-top-card__bullet",
    ".topcard__flavor--bullet",
    "[data-testid*=location]",
    "[class*=job-location]"
  ], detailRoot) || clean(linkedInLocation);
  const description = clean(jobPosting.description?.replace(/<[^>]+>/g, " ")) || firstText([
    ".jobs-description-content__text",
    ".jobs-box__html-content",
    ".show-more-less-html__markup",
    ".description__text",
    "[data-testid*=description]",
    "[class*=job-description]",
    "#job-details"
  ], detailRoot) || aboutJobText();
  const salaryMatch = detailText.match(/(?:\$|USD\s?)(?:\d{2,3}(?:,\d{3})?)(?:\s?[-–—]\s?(?:\$|USD\s?)?\d{2,3}(?:,\d{3})?)?(?:\s?(?:per|\/)?\s?(?:year|yr|hour|hr))?/i);
  const salary = clean(jobPosting.baseSalary?.value?.value ? String(jobPosting.baseSalary.value.value) : salaryMatch?.[0] || "");
  return {
    title,
    company,
    location: jobLocation,
    salary,
    description: description.slice(0, 6000),
    url: pageUrl,
    pageTitle,
    source: /linkedin\.com/i.test(pageUrl) ? "linkedin" : jobPosting.title ? "json-ld" : "generic",
    extractionScope: detailRoot === document ? "document" : "selected-job-pane",
    ogDescription: meta("description") || meta("og:description", true),
  };
}

function terms(value = "") {
  return value.toLowerCase().split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

function numericSalary(value = "") {
  const matches = value.replace(/,/g, "").match(/\d{2,6}/g) || [];
  return Math.max(0, ...matches.map(Number).map((number) => number < 1000 ? number * 1000 : number));
}

function scoreOpportunity(data, profile = {}) {
  let score = 32;
  const signals = [];
  if (data.title) { score += 12; signals.push("recognizable role"); }
  if (data.company) { score += 10; signals.push("named employer"); }
  if (data.location) score += 8;
  if (data.salary) { score += 18; signals.push("salary disclosed"); }
  if (data.description.length > 700) score += 10;
  if (/rockstar|ninja|guru|work hard play hard|unlimited earning/i.test(data.description)) { score -= 8; signals.push("contains concentrated LinkedIn slurry"); }
  if (/commission.only|1099|independent contractor/i.test(data.description)) { score -= 7; signals.push("employment terms deserve scrutiny"); }
  score = Math.max(8, Math.min(96, score));
  const titleTargets = terms(profile.targetTitles);
  const keywordTargets = terms(profile.targetKeywords);
  const locationTargets = terms(profile.targetLocations);
  const hasProfile = titleTargets.length || keywordTargets.length || locationTargets.length || Number(profile.minimumSalary) || profile.resumeEvidence;
  if (!hasProfile) return { quality: score, fit: null, signals, fitSignals: [] };
  let fit = 30;
  const fitSignals = [];
  const haystack = `${data.title} ${data.description}`.toLowerCase();
  const titleHits = titleTargets.filter((term) => data.title.toLowerCase().includes(term));
  const keywordHits = keywordTargets.filter((term) => haystack.includes(term));
  if (titleTargets.length) { fit += Math.min(30, titleHits.length * 20); fitSignals.push(`${titleHits.length}/${titleTargets.length} target titles matched`); }
  if (keywordTargets.length) { fit += Math.min(25, Math.round((keywordHits.length / keywordTargets.length) * 25)); fitSignals.push(`${keywordHits.length}/${keywordTargets.length} skill signals matched`); }
  if (locationTargets.length && locationTargets.some((term) => data.location.toLowerCase().includes(term) || haystack.includes(term))) { fit += 10; fitSignals.push("location preference matched"); }
  const minimum = Number(profile.minimumSalary) || 0;
  const listedSalary = numericSalary(data.salary);
  if (minimum && listedSalary) { fit += listedSalary >= minimum ? 10 : -15; fitSignals.push(listedSalary >= minimum ? "salary clears minimum" : "salary may miss minimum"); }
  if (profile.resumeEvidence && keywordHits.length) fit += 5;
  return { quality: score, fit: Math.max(5, Math.min(98, fit)), signals, fitSignals };
}

function creatureVerdict(data, result) {
  if (!data.title && !data.company) return "LinkedIn has wrapped the meal in interface debris. Correct the blank fields while I sharpen my selectors.";
  if (!data.title || !data.company) return "I found most of the listing, but one label escaped digestion. Correct the blank field and we proceed.";
  if (result.fit === null) return "The listing is legible. Personal compatibility remains occult until you configure your appetite.";
  if (!data.salary) return "Potential fit detected, but the salary has retreated into the shadows. A classic employer defense mechanism.";
  if (result.fit >= 80) return "Your evidence and this role appear unusually compatible. Suspiciously nutritious.";
  if (result.fit >= 60) return "Plausible fit. Not destiny, not garbage. A respectable mortal opportunity.";
  return "I have consumed worse, but usually by accident. Review this one before sacrificing an afternoon.";
}

function fillForm(data, profile) {
  ["title", "company", "location", "salary", "url", "description"].forEach((key) => { $(key).value = data[key] || ""; });
  const result = scoreOpportunity(data, profile);
  $("listing-score").textContent = `${result.quality}`;
  $("fit-score").textContent = result.fit === null ? "SET UP" : `${result.fit}`;
  $("confidence").textContent = result.fit === null ? "Fit not configured" : "Local estimate";
  setCreatureCopy(creatureVerdict(data, result));
}

async function scanPage() {
  const button = $("scan-button");
  button.disabled = true;
  button.textContent = "Digesting corporate matter…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("I cannot locate the active tab. The browser has hidden the plate.");
    const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractJobData });
    const { fitProfile = {} } = await chrome.storage.local.get("fitProfile");
    fillForm(result || {}, fitProfile);
    showView("review");
  } catch (error) {
    const message = error?.message || "";
    const permissionFailure = /cannot access|missing host permission|chrome:\/\/|edge:\/\/|extensions gallery/i.test(message);
    showError(permissionFailure
      ? "I do not have permission to inspect this page yet. This build is authorized for LinkedIn job pages; refresh LinkedIn after reloading the extension."
      : message || "I failed to digest this page. Paste the details manually and tell no one.");
  } finally {
    button.disabled = false;
    button.textContent = "Inspect this opportunity";
  }
}

async function saveOpportunity(event) {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(event.currentTarget));
  const opportunity = { ...formData, id: crypto.randomUUID(), capturedAt: new Date().toISOString(), stage: "captured" };
  const { opportunities = [] } = await chrome.storage.local.get("opportunities");
  await chrome.storage.local.set({ opportunities: [opportunity, ...opportunities] });
  $("saved-summary").textContent = `${opportunity.title || "Untitled opportunity"} at ${opportunity.company || "an unnamed corporate entity"} is now in the local stomach.`;
  setCreatureCopy("The meal has been catalogued. Go finish the application before it learns to escape.");
  showView("saved");
}

async function copySaved() {
  const { opportunities = [] } = await chrome.storage.local.get("opportunities");
  await navigator.clipboard.writeText(JSON.stringify(opportunities, null, 2));
  $("export-button").textContent = `Copied ${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"}`;
}

async function loadProfile() {
  const { fitProfile = {} } = await chrome.storage.local.get("fitProfile");
  Object.entries(fitProfile).forEach(([key, value]) => {
    const field = document.querySelector(`[name="${key}"]`);
    if (field) field.value = value;
  });
}

async function saveProfile(event) {
  event.preventDefault();
  const fitProfile = Object.fromEntries(new FormData(event.currentTarget));
  await chrome.storage.local.set({ fitProfile });
  setCreatureCopy("Appetite recorded. I can now distinguish your career goals from random edible rectangles.");
  showView("scan");
}

$("scan-button").addEventListener("click", scanPage);
$("rescan-button").addEventListener("click", scanPage);
$("opportunity-form").addEventListener("submit", saveOpportunity);
$("another-button").addEventListener("click", () => { showView("scan"); setCreatureCopy("I remain hungry. Present the next corporate offering."); });
$("export-button").addEventListener("click", copySaved);
$("hunt-tab").addEventListener("click", () => showView("scan"));
$("profile-tab").addEventListener("click", async () => { await loadProfile(); showView("profile"); });
$("profile-form").addEventListener("submit", saveProfile);
