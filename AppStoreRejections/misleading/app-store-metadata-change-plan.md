# App Store Metadata Change Plan

Date: 2026-05-25

Goal: remove any reasonable App Review basis for reading StreamTracker as an app that streams, plays, hosts, downloads, unlocks, or distributes movies/TV shows.

## Recommended Changes Before Resubmission

### 1. Description

Current:

```text
StreamTracker is an app for users to discover movies & TV shows, find streaming options, and create watchlists!
```

Recommendation: clarify that StreamTracker is not the streaming provider, but a place to find where to stream.

Preferred concise description:

```text
StreamTracker helps you discover movies & TV shows, find where to stream, and create watchlists!
Use StreamTracker to search for titles, view movie & TV show details, save favorites, manage watchlists, and link directly to streaming providers.
```

Why:

- Keeps the same product promise.

### 2. Subtitle

Current:

```text
Track Streaming Movies & Shows
```

Recommendation: change.

Preferred:

```text
Track Where to Stream
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
```

'Track where to stream Movies & Shows' is clearer than the current subtitle, but likely too long for the subtitle field and still centers `stream`.

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

## Recommended Response Position

Response should say:

- We were not attempting to mislead users.
- References to streaming were intended to describe where titles are available from third-party streaming providers.
- To avoid any possible ambiguity, we updated the subtitle, description, keywords, and Review Notes.
- Provider links open official third-party destinations when available.
- Ask Apple to identify any remaining specific metadata item or screen if they still see a 1.1.6 issue.

Response should not say:

- The rejection is frivolous.
- Other apps do this.
- The old wording was impossible to misunderstand.
- A disclaimer solves everything.
