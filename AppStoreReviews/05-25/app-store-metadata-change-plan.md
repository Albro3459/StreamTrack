# App Store Metadata Change Plan

Date: 2026-05-25

Goal: remove any reasonable App Review basis for reading StreamTracker as an app that streams, plays, hosts, downloads, unlocks, or distributes movies/TV shows.

## Recommended Changes Before Resubmission

### 1. Subtitle

Current:

```text
Track Streaming Movies & Shows
```

Recommendation: change.

Preferred:

```text
Track Where to Watch
```

Why:

- It is under the 30-character subtitle limit.
- It makes the app's function about availability and tracking, not playback.
- It avoids the phrase `streaming movies`, which appears to be the current trigger.

Acceptable alternatives:

```text
Find Where to Watch
Track Movies & Shows
Find Watch Options
```

Avoid:

```text
Track Streaming Movies & Shows
Stream Movies & Shows
Watch Streaming Movies
Track where to stream Movies & Shows
```

The last option is clearer than the current subtitle, but likely too long for the subtitle field and still centers `stream`.

### 2. Description

Current:

```text
StreamTracker is an app for users to discover movies & TV shows, find streaming options, and create watchlists!
```

Recommendation: change the first sentence.

Preferred concise description:

```text
StreamTracker helps you discover movies and TV shows, find where they are legally available to watch, and organize watchlists.

Use StreamTracker to search for titles, view movie and TV details, save favorites, manage watchlists, and open official provider links when available. StreamTracker does not play, host, download, or stream movies or TV shows in the app.
```

Why:

- Keeps the same product promise.
- Changes `find streaming options` to `find where they are legally available to watch`.
- Places the no-playback clarification in the first visible description area without making the entire description sound defensive.

Fallback if Apple remains rigid:

```text
StreamTracker is a movie and TV discovery, availability, and watchlist app. It does not play, host, download, or stream movies or TV shows in the app.

Search for titles, view details, save favorites, manage watchlists, and find where content is legally available to watch through official provider links when available.
```

### 3. Promotional Text

Current: none.

Recommendation: leave blank for this resubmission.

Why:

- Promotional text is another metadata surface Apple can scrutinize.
- The description and subtitle are enough for the response.

If a promotional text is required later:

```text
Discover movies and shows, organize watchlists, and find official watch options.
```

### 4. Keywords

Current:

```text
Stream, Movie, Tv, Television, Streaming, Watch
```

Recommendation: change.

Preferred:

```text
movies,tv,shows,watchlist,tracker,discover,ratings
```

Possible broader version:

```text
movies,tv,shows,watchlist,tracker,discover,watch,availability
```

Why:

- Keywords are metadata even if users do not see them.
- `Stream` and `Streaming` could reinforce the exact ambiguity Apple cited.
- `Watch` is probably acceptable, but if we want a cleaner resubmission, use `watchlist` and `availability` instead.

### 5. Screenshots

Current: basic simulator screenshots of landing, login, content details, search, library, and profile.

Recommendation: keep plain screenshots, but review the exact image set before resubmission.

Preferred screenshot set:

- Landing page showing discovery/watchlist browsing without provider-branded section titles dominating the image.
- Search page.
- Content details page showing metadata and provider links, ideally with `Where to Watch` / `Available On` if the UI is updated.
- Library/watchlist page.
- Login page only if needed.

Avoid or defer:

- Profile screenshot if it prominently shows `Streaming Services` and that label is not changed or hidden.
- Screenshots dominated by `Only on Disney+`, `Popular on Disney+`, provider logos, or any one studio/provider brand.
- Screenshots that look like playback, downloads, unlocked content, or provider catalogs inside StreamTracker.

### 6. Review Notes

Current:

```text
Sign in with email and password. Should be straightforward. Sign in with Apple and Google also works.
```

Recommendation: replace with a fuller App Review note.

Suggested Review Notes:

```text
StreamTracker is a movie and TV discovery, availability, and watchlist app. It does not play, host, download, stream, unlock, sell, or distribute movies or TV episodes in the app.

Users can search for titles, view movie/TV metadata, save favorites and watchlists, and view provider availability. When a provider link is available, tapping it opens the official third-party provider destination outside StreamTracker or through the provider's own link handling. StreamTracker has no embedded video player and no media download controls.

In response to the prior Guideline 1.1.6 message, we clarified the App Store subtitle and description to say the app helps users find where movies and shows are legally available to watch. Any references to providers or availability are intended only to identify legal watch options, not to imply in-app playback.

Sign in with email/password, Apple, or Google. The review account can use the provided credentials.
```

Add actual reviewer credentials below this text in App Store Connect if applicable. Do not put credentials in repo docs.

## Recommended In-App Copy Changes

These are not strictly required if the next submission only changes App Store metadata, but they would make the response stronger.

### Profile

Current:

```text
Streaming Services
```

Recommended:

```text
Preferred Services
```

or:

```text
Favorite Services
```

Best option if this setting still does not affect recommendations:

- Hide the selector until it affects the experience, or rename it to `Preferred Services` and explain in Review Notes that these are saved profile preferences only in this build.

### Content Details

Current:

```text
Where to Stream
```

Recommended:

```text
Where to Watch
```

or:

```text
Available On
```

Why:

- Keeps the useful provider-link feature.
- Avoids the exact word Apple flagged.

### Landing Sections

Current examples:

```text
Popular on Disney+
Only on Disney+
Free to Stream
```

Recommended if changing backend section titles now:

```text
Available on Disney+
Disney+ Availability
Free to Watch
```

Why:

- Reduces provider-catalog and in-app streaming implications.
- Avoids strong/stale claims like `Only on`.

## Recommended Minimum Resubmission Package

Minimum changes:

1. Change subtitle to `Track Where to Watch`.
2. Change description to the preferred concise description.
3. Change keywords to remove `Stream` and `Streaming`.
4. Replace Review Notes with the fuller note above.
5. Do not include the profile screenshot unless the `Streaming Services` label is changed or hidden.

Stronger changes:

1. Do all minimum changes.
2. Rename `Where to Stream` to `Where to Watch`.
3. Rename or hide profile `Streaming Services`.
4. Rename landing `Free to Stream` and consider removing `Only on ...` section labels.

## Recommended Response Position

Response should say:

- We believe the app was misunderstood.
- To avoid any possible ambiguity, we updated the subtitle, description, keywords, and Review Notes.
- StreamTracker is discovery/watchlist/availability only.
- There is no player, hosting, streaming, download, unlock, or distribution feature.
- Provider links open official third-party destinations when available.
- Ask Apple to identify any remaining specific metadata item or screen if they still see a 1.1.6 issue.

Response should not say:

- The rejection is frivolous.
- Other apps do this.
- The old wording was impossible to misunderstand.
- A disclaimer solves everything.
