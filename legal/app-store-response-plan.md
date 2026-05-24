# Apple 5.2.1 Response And Disclosure Plan

- In the App Store, the app is called “StreamTracker”, so use that instead of “StreamTrack”.

## Summary
- Write a source-backed App Review response that reframes StreamTracker as a legal media discovery/watchlist app, not a Disney/Pixar content app and not a streaming/download app.
- Voluntarily disclose the backend content-data sources at a high level: TMDB for title metadata/poster URLs and Movie of the Night Streaming Availability API/RapidAPI for availability/provider/deep-link data.
- Do not lead with “fair use.” Lead with app function, no hosted content, no video access, API-based metadata, legal outbound provider links, no affiliation/confusion, and a request for Apple to identify the exact disputed screen or asset.
- No public API/type changes are needed. Recommended changes are policy/submission artifacts plus a possible in-app/About attribution item before resubmission.

## Response Package
- Create a concise Apple Resolution Center reply using `legal/app-store-rejection.md` and `legal/app-store-ip-research.md`.
- Include these claims only:
  - StreamTracker does not host, stream, download, sell, or distribute Disney/Pixar video content.
  - The app displays movie/TV metadata, poster images, provider identifiers, and availability information for title identification and legal viewing discovery.
  - The app routes users to official third-party provider destinations when links are available.
  - StreamTracker is not affiliated with, endorsed by, sponsored by, or certified by Disney, Pixar, TMDB, Movie of the Night, or streaming providers.
  - Disney/Pixar marks or works are not used in the app name, icon, developer name, or app branding.
- Include one calm clarification request:
  - Ask Apple to identify the specific screen, title, image, logo, metadata item, or App Store metadata asset they believe violates 5.2.1.
- Avoid:
  - “Other apps do it.”
  - Angry language.
  - Overclaiming that APIs fully authorize Disney/Pixar IP.
  - Saying “it comes from an API, so it cannot infringe.”
  - Citing fair use as the only defense without context.

## App Review Attachments And Submission Notes
- Add App Review Notes that explain the backend data flow:
  - Client app calls StreamTracker backend.
  - Backend calls TMDB and Movie of the Night/Streaming Availability API.
  - API keys are server-side and are not exposed in the app build.
  - User account identifiers, email, name, lists, and favorites are not forwarded to TMDB or Movie of the Night for normal content lookup.
  - Search text may be sent to the backend and then to TMDB to fulfill search requests; title IDs may be sent to the availability provider to fulfill detail/availability requests.
- Attach or link:
  - TMDB API documentation, attribution page, and proof of API access/license status.
  - Movie of the Night Streaming Availability API docs and proof of account/subscription/API access.
  - RapidAPI subscription/access proof if that is the active provider path.
  - Screenshots showing the app has no video player, no download controls, and only discovery/watchlist/provider-link behavior.
  - Screenshots showing StreamTracker-owned app icon/name/branding.
  - Screenshot or URL for the updated privacy policy.
- Do not attach API secrets, tokens, backend source code, private database records, or anything that exposes credentials.

## Privacy Policy And App Store Disclosures
- Update `API/Pages/PrivacyPolicy.html` before resubmission.
- Use `legal/app-store-current-privacy-disclosures.md` as the current-state snapshot and `legal/app-store-privacy-disclosure-updates.md` as the update checklist.
- Replace the inaccurate blanket sentence “Only aggregated, anonymized data is periodically transmitted to external services...” with a more precise disclosure:
  - StreamTracker uses backend services and third-party content-data providers to retrieve movie/TV metadata, images, streaming availability, prices, and provider links.
  - To fulfill searches and content-detail requests, StreamTracker may send search text or title/content identifiers to those providers.
  - StreamTracker does not send the user’s email, name, Firebase user ID, custom lists, favorites, or account profile data to content-data providers for those lookups.
- Add third-party service links for:
  - TMDB privacy/terms/API attribution.
  - Movie of the Night Streaming Availability API privacy/terms or developer documentation.
  - RapidAPI privacy policy if RapidAPI remains the gateway.
  - Keep Expo and Firebase Authentication.
- Add a short “Third-Party Content And Attribution” paragraph, preferably outside the privacy-only data-sharing paragraph:
  - Metadata/images/availability may be provided by TMDB and Movie of the Night.
  - Streaming provider names/logos are used only to identify legal availability.
  - StreamTracker is not affiliated with or endorsed by those providers.
- Update App Store Connect App Privacy answers if they do not already reflect actual behavior:
  - Contact Info: email/name, linked to user, used for app functionality/account management.
  - User Content: custom list names, watchlists, favorites, saved movies/TV shows, and shared list membership.
  - Other Data Types: favorite genres, favorite streaming services, and other account-level profile preferences.
  - Search History: conservative recommendation is to disclose because search terms leave the device through the backend; choose linked/not-linked after verifying server and provider logs.
  - Do not mark Tracking unless data is linked with third-party data for ads, ad measurement, or data brokers.
  - Keep Crash Data, and add Performance Data only if diagnostics tooling collects it in a way you can access.

## Test And Review Checklist
- Verify every factual claim in the response against the app:
  - No in-app video playback.
  - No download/save media flow.
  - Provider links leave the app or open official provider destinations.
  - App branding is StreamTracker-owned.
- Verify the updated privacy policy matches backend behavior:
  - Search text goes to backend and TMDB.
  - TMDB IDs/content IDs go to availability/detail providers.
  - Account identifiers are not forwarded to content-data providers.
- Review App Store screenshots/previews:
  - They should show discovery/watchlist behavior.
  - They should not make Disney/Pixar/provider artwork look like StreamTracker branding or a promotional hero.
- Have counsel or a legally qualified reviewer verify fair use, nominative use, and API-license wording before submitting if the response relies on those legal arguments.

## Assumptions
- The app is free, has no ads, and does not track users across apps/websites.
- The submitted build does not contain video playback, download, or stream-ripping functionality.
- TMDB and Movie of the Night/RapidAPI are the current data sources.
- The plan does not remove third-party posters, provider logos, Disney+ sections, or other in-app content; it adds explanation, documentation, attribution, and disclosure around the existing behavior.
