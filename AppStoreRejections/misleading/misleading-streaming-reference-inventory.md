# Misleading Streaming Reference Inventory

Date: 2026-05-25

Status: internal working notes for the next App Review response plan. This is not the response draft.

## Current Rejection

Apple rejected the app under Guideline 1.1.6 on 2026-05-25:

- "The app contains content or features that are misleading, intended to deceive users, or are otherwise fraudulent."
- "Specifically, the metadata includes misleading reference to media streaming."
- "Please note that adding a disclaimer to the app description is not sufficient if the rest of the metadata and the app are misleading."

This is a different rejection posture than the 2026-05-23 Guideline 5.2.1 intellectual-property rejection.

## Prior 05-23 Packet Context

The final 05-23 Resolution Center reply framed StreamTracker as:

- A media discovery and watchlist app.
- Not an app that hosts, streams, downloads, sells, or distributes third-party video content.
- An app that displays metadata, poster images, provider identifiers, streaming availability, prices, and provider links so users can identify titles and find where they may legally watch or purchase them from official providers.
- An app where provider links open official third-party destinations when links are available.

The 05-23 packet also noted privacy work that was actually done:

- App Privacy disclosures were updated to include Contact Info, User ID, Other User Content, Other Data Types, Search History, and Crash Data.
- Search History was disclosed as not linked to user identity based on the stated implementation fact that searches are not saved to account profiles or connected to identity in logs.
- App Review Notes described TMDB, Movie of the Night, RapidAPI, Expo, and Firebase-related data flow.

For 05-25, the key shift is that Apple is no longer asking for Disney/Pixar documentation. They are saying the product presentation may imply media streaming.

## Likely Apple Concern Surfaces

### App Store Subtitle

Current subtitle reported by owner:

```text
Track Streaming Movies & Shows
```

Risk: high.

Why Apple may object:

- The phrase can read as "track movies and shows that are streaming" or as "track streaming movies/shows."
- It does not explicitly say the app tracks where content is available.
- It appears directly under the app name in App Store search/product surfaces, so Apple may treat it as a primary metadata promise.

Recommended change in App Store Connect:

- Replace it before the next submission.
- Keep the new subtitle at or under Apple's 30-character subtitle limit.

Candidate subtitles:

- `Track Where to Watch` - 20 characters.
- `Find Where to Watch` - 19 characters.
- `Track Movies & Shows` - 20 characters.
- `Find Streaming Options` - 22 characters.

Owner-proposed wording:

```text
Track where to stream Movies & Shows
```

This is clearer than the current subtitle, but likely too long for the 30-character App Store subtitle field.

### App Store Description

Current description sentence reported by owner:

```text
StreamTracker is an app for users to discover movies & TV shows, find streaming options, and create watchlists!
```

Risk: medium.

Defensible reading:

- "discover movies & TV shows" describes discovery.
- "find streaming options" describes availability lookup.
- "create watchlists" describes tracking/list behavior.
- It does not say users can stream or watch content inside StreamTracker.

Why Apple may still object:

- The app name begins with "Stream."
- The subtitle says "Track Streaming Movies & Shows."
- The icon uses a cloud with upload/download arrows.
- In combination, "find streaming options" may be read by App Review as promising streaming access unless the first sentence immediately says "where to watch" or "no in-app playback."

Recommended App Store Connect adjustment:

```text
StreamTracker helps you discover movies and TV shows, find where they are legally available to watch, and organize watchlists.
```

Optional first-line disclaimer if Apple remains stuck:

```text
StreamTracker does not play, host, download, or stream movies or TV shows in the app.
```

This should be used carefully. Apple already said a disclaimer alone is insufficient, so the rest of the metadata and app UI should also be tightened.

### App Icon And Logo

Current assets:

- `APP/assets/images/AppIconDark.png`: cloud outline with up/down arrows.
- `APP/assets/images/AppLogoDark.png`: same cloud/arrows plus `STREAMTRACKER`.
- `APP/app.config.js`: uses `./assets/images/AppIconDark.png` as the app icon and `./assets/images/AppLogoClear.png` as the splash image.

Risk: low to medium.

Defensible reading:

- The icon is original StreamTracker branding.
- It does not use a third-party service mark, movie artwork, play button, video player, or provider logo.
- Cloud/upload/download imagery can reference information flow and streaming availability without promising video playback.

Why Apple may still object:

- Cloud plus arrows can also suggest upload/download/transfer of media.
- In combination with "StreamTracker" and "Track Streaming Movies & Shows," it may reinforce Apple's mistaken read that the app handles streamed content itself.

Recommended posture:

- Do not lead with an icon change in the first response unless Apple identifies the icon as the issue.
- If Apple repeats the same rejection after metadata text is clarified, consider a more obviously tracking/discovery-oriented icon, such as a checklist, magnifier, map pin, ticket, or library motif.

### Profile Page "Streaming Services"

Source:

- `APP/app/ProfilePage.tsx`
- Visible label: `Streaming Services`
- The screen lets users save selected provider names through `updateUserProfile(...)`.

Risk: medium to high.

Defensible reading:

- It is a profile-preference selector, not a player.
- Streaming providers are real availability filters/categories in this product domain.

Why Apple may object:

- The profile page does not explain that these are preferences only.
- Owner has confirmed this selector is intended for a future recommendation system and currently has no impact on recommendations.
- A reviewer may reasonably think selecting services should change the app's content recommendations or availability filtering today.
- Because the 05-25 rejection says a disclaimer is insufficient if "the rest of the metadata and the app" are misleading, this in-app control may matter even though Apple specifically said "metadata."

Implementation fact from source review:

- `APP/app/helpers/StreamTrack/userHelper.ts` sends `StreamingServices` in the PATCH body for `API/User/Update`.
- `API/Controllers/UserController.cs` stores selected services on the user.
- `API/Service/HelperService.cs` recommendation logic uses the selected title's genres and streaming options, not the user's saved streaming services.
- `API/Service/PopularSortingService.cs` filters landing sections by provider availability in content records, not by the user's saved profile services.

Recommended product change before next submission:

- Either hide this selector until it affects the user experience, or rename it to avoid implying active filtering/personalization.

Safer label options:

- `Favorite Services`
- `Preferred Services`
- `Service Preferences`

If kept visible, App Review Notes should say profile service selections are saved preferences only in this build and do not unlock playback.

### Info Page "Where to Stream"

Source:

- `APP/app/InfoPage.tsx`
- Visible label: `Where to Stream`
- Provider logos are displayed from `streamingOption.streamingService.darkLogo`.
- Tapping a provider opens `streamingOption.deepLink` with `Linking.openURL(...)`.

Risk: medium.

Defensible reading:

- This is implemented functionality.
- The app opens official third-party provider destinations when links are available.
- The app has no embedded video player and no download control.

Why Apple may object:

- "Where to Stream" is common language, but in this review context "stream" appears to be a trigger word.
- Provider logos next to "Where to Stream" may be read as a promise that streaming happens in StreamTracker.

Possible UI wording change:

- `Where to Watch`
- `Available On`
- `Watch Options`

This is less urgent than the App Store subtitle, but more concrete than debating the logo.

### Landing Page Provider Sections

Source:

- `API/Controllers/ContentController.cs`
- Section titles include `Popular on Disney+`, `Only on Disney+`, `Popular on Netflix`, `Only on Netflix`, and similar provider strings.
- `APP/app/LandingPage.tsx` renders backend section titles directly.

Risk: medium.

Defensible reading:

- These are provider-availability categories generated from content records.
- They do not create playback controls or imply StreamTracker owns provider catalogs.

Why Apple may object:

- `Only on Disney+` and similar titles can look like provider-branded catalog promotion.
- The previous 05-23 IP rejection already made Disney/Pixar/provider branding a sensitive review surface.
- "Only on" is also a strong availability claim and can become stale if provider availability changes.

Possible UI wording change:

- `Available on Disney+`
- `Popular with Disney+ Availability`
- `Disney+ Availability`

The best response plan should decide whether to change this now or hold it as a fallback. If Apple specifically says metadata, the App Store subtitle/description should be first.

### Privacy Policy And App Review Notes

Source:

- `API/Pages/PrivacyPolicy.html`

Risk: low.

Relevant wording:

- The privacy policy refers to "streaming availability," "provider links," "streaming provider link," and third-party content/provider data.

Defensible reading:

- This is accurate privacy/data-flow wording.
- It does not market the app as streaming content.
- It explains that third-party provider links leave the app.

Recommended posture:

- Do not weaken privacy accuracy just to avoid the word "streaming."
- If editing for consistency, prefer "watch availability" or "availability/provider links" only where it does not make privacy disclosures less precise.

### README

Source:

- `README.md`

Risk: low for App Review unless it was attached or linked.

The README contains the same overview sentence:

```text
StreamTrack is an app for users to discover movies & TV shows, find streaming options, and create watchlists.
```

Recommended posture:

- Do not treat this as an App Store metadata blocker unless it is linked in App Review Notes, Support URL, Marketing URL, or uploaded evidence.

## Current Working Ranking

Most likely issue:

1. App Store subtitle: `Track Streaming Movies & Shows`.
2. App Store description first sentence, in combination with the app name/icon.
3. Profile page `Streaming Services`, because it is currently a saved preference with no visible effect.
4. Info page `Where to Stream` and provider logos.
5. Landing page provider sections like `Popular on Disney+` / `Only on Disney+`.
6. Cloud/up/down icon.

## Information Still Needed

Before drafting the actual Apple response, collect the exact App Store Connect metadata from the rejected submission:

- Current subtitle.
- Full description.
- Promotional text.
- Keywords.
- App category and subcategory.
- App Store screenshots and app previews for each device size submitted.
- Any custom product pages or product page optimization variants.
- Current review notes.
- Any attachments uploaded with the 05-25 submission.
- Whether the updated privacy policy was live when Apple reviewed the 05-25 submission.
