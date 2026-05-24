# App Store Final Submission Packet

Date: 2026-05-24

Status: ready to use after the production privacy policy deploy and evidence upload.

## Hard Pre-Send Blocker

Do not send the Resolution Center reply yet if `https://streamtrack.gocloudlaunch.com/privacy-policy` is still serving the old policy.

Verification result on 2026-05-24:

- The repo policy at `API/Pages/PrivacyPolicy.html` is updated.
- The live URL still served the old 2025-07-20 policy with only Expo/Firebase listed and the old "Only aggregated, anonymized data..." wording.

Before replying to Apple:

1. Deploy the updated API/privacy policy to production.
2. Open `https://streamtrack.gocloudlaunch.com/privacy-policy`.
3. Confirm the live page includes:
   - Effective date `2026-05-24`.
   - TMDB.
   - Movie of the Night Streaming Availability API.
   - RapidAPI.
   - Expo.
   - Firebase Authentication.
   - The third-party content/no-affiliation attribution paragraph.

## App Review Notes

Paste this into App Review Information / Review Notes.

```text
StreamTracker is a legal movie and TV discovery/watchlist app. The app does not stream, host, download, sell, or distribute video content.

Data flow:
- The iOS app calls the StreamTracker backend.
- The backend calls TMDB for title metadata and poster/backdrop image URLs.
- The backend calls Movie of the Night's Streaming Availability API through RapidAPI for streaming availability, prices, provider names/logos, and provider deep links.
- API credentials are stored server-side and are not present in the compiled app.
- Account identifiers, email, name, custom lists, favorites, and profile preferences are not sent to TMDB, Movie of the Night, or RapidAPI for ordinary content lookups.
- Search terms may be sent to the backend and TMDB to return search results.
- Movie/TV identifiers may be sent to the availability provider to return content details and legal availability information.

Reviewer behavior:
- Tapping a movie or TV show opens a detail page with metadata, posters, availability, and provider links.
- Tapping a provider link opens the official provider destination when a link is available.
- The app contains no embedded movie/TV player and no download/save video feature.

Privacy:
- The App Privacy disclosures have been updated to include Contact Info, User ID, Other User Content, Other Data Types, Search History, and Crash Data.
- Search History is disclosed as not linked to the user's identity because searches are not saved to account profiles and are not connected to user identity in application logs.
- StreamTracker does not use user data for third-party advertising or tracking.
- Updated privacy policy: https://streamtrack.gocloudlaunch.com/privacy-policy
```

## Evidence Upload Checklist

Upload these before sending the Resolution Center reply.

App and privacy evidence:

- Screenshot/PDF of the updated live privacy policy.
- Screenshot/PDF of updated App Store privacy disclosures.
- Screenshot of the app icon, app name, subtitle, and developer name showing StreamTracker-owned branding.
- Screenshots of the landing, search, detail, library/watchlist, and provider-link flows.
- Screenshot showing there is no in-app video player or download/save video control.

Data provider documentation:

- TMDB FAQ: `https://developer.themoviedb.org/docs/faq`
- TMDB attribution page: `https://www.themoviedb.org/about/logos-attribution`
- TMDB API terms: `https://www.themoviedb.org/api-terms-of-use`
- Movie of the Night API docs: `https://docs.movieofthenight.com/`
- Movie of the Night image docs: `https://docs.movieofthenight.com/guide/images`
- Movie of the Night shows docs: `https://docs.movieofthenight.com/resource/shows`
- Movie of the Night countries docs: `https://docs.movieofthenight.com/resource/countries`

Account/access evidence:

- TMDB account/API access or license-status proof, with API tokens redacted.
- Movie of the Night/RapidAPI account or subscription proof, with API keys redacted.

Redaction rules:

- Redact all API keys, bearer tokens, Firebase IDs, account IDs, payment details, billing details, private user data, request headers, debug logs, and any private backend URLs not intended for Apple.
- Do not upload backend source code or database records.

## Resolution Center Reply

Paste this after the evidence is uploaded and the live privacy policy is verified.

```text
Hello App Review,

Thank you for the follow-up.

We believe there may be a misunderstanding about the app's functionality. StreamTracker is a media discovery and watchlist app. It does not host, stream, download, sell, or distribute Disney/Pixar video content, or any other third-party video content.

The app displays movie and TV metadata, poster images, provider identifiers, streaming availability, prices, and provider links so users can identify titles and find where they may legally watch or purchase them from official providers. Any provider links open the official third-party destination when available; StreamTracker does not unlock or play that content in the app.

The submitted app is not affiliated with, endorsed by, sponsored by, or certified by Disney, Pixar, TMDB, Movie of the Night, RapidAPI, or any streaming provider. Disney/Pixar marks or works are not used in the app name, app icon, developer name, or app branding. Third-party names, logos, images, and metadata are used only for functional title identification, provider identification, discovery, watchlist, and legal availability purposes.

For transparency, the compiled client app calls the StreamTracker backend. The backend retrieves movie and TV metadata and image URLs from The Movie Database (TMDB), and retrieves streaming availability/provider/deep-link information from Movie of the Night's Streaming Availability API through RapidAPI. API credentials are kept server-side and are not exposed in the app build. User account identifiers, email, name, custom lists, favorites, and profile preferences are not forwarded to those content-data providers for normal content lookups.

We have included documentary evidence in App Review Information for the data sources and the app's behavior, including provider documentation and screenshots showing that the app has no video player, no download controls, and only discovery/watchlist/provider-link functionality. We have also updated the privacy policy and App Privacy disclosures to describe the content-data providers and data flow more explicitly.

Could you please identify the specific screen, title, image, logo, metadata item, or App Store metadata asset that App Review believes violates Guideline 5.2.1? We are happy to review any specific concern, but the current message only refers generally to "Disney/Pixar material" without identifying the disputed material.

Thank you.
```

## If Replying Before Uploads Finish

Use this sentence instead of "We have included documentary evidence...":

```text
We are including documentary evidence in App Review Information for the data sources and the app's behavior, including provider documentation and screenshots showing that the app has no video player, no download controls, and only discovery/watchlist/provider-link functionality. We have also updated the privacy policy and App Privacy disclosures to describe the content-data providers and data flow more explicitly.
```

## Final Send Checklist

- Live privacy policy verified after deployment.
- App Privacy disclosures match `legal/app-store-current-privacy-disclosures.md`.
- Evidence uploaded with secrets and private information redacted.
- Review Notes pasted into App Review Information.
- Resolution Center reply pasted after evidence upload.
- `legal/app-store-ip-research.md` kept internal unless Apple asks for more detail.
