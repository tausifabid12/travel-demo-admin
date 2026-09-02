"use client";

/**
 * Clears the stored consent so the banner reappears, letting someone revisit
 * a choice they already made.
 */
export default function CookiePreferencesButton() {
  const reset = () => {
    try {
      window.localStorage.removeItem("bhancer-cookie-consent");
    } catch {
      // Storage can be unavailable; the banner simply will not reappear.
    }
    // Tells the consent banner to re-read the cleared choice.
    window.dispatchEvent(new Event("local-storage"));
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={reset}
      className="mt-4 inline-flex items-center rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium text-ink no-underline transition-colors hover:border-ink"
    >
      Change cookie preferences
    </button>
  );
}
