# Misleading Streaming Research

Date: 2026-05-25

Status: research notes for formulating the next App Review response. Not legal advice.

## Apple Rejection Frame

Apple cited Guideline 1.1.6, but the explanation is really about product presentation:

- Apple says the app/metadata has a misleading reference to media streaming.
- Apple says adding a disclaimer to the description is not enough if the rest of the metadata and app are misleading.

Practical interpretation: the response should not only say "we do not stream." It should also point to clarified App Store metadata, clarified UI if changed, and concrete app behavior.

## Apple Sources

### Guideline 1.1.6

Apple's App Store Review Guidelines define 1.1.6 as false information/features. Relevant source:

- https://developer.apple.com/app-store/review/guidelines/

Relevant text summary:

- Guideline 1.1.6 covers false information and features, including inaccurate device data or trick/joke functionality.
- Apple says a statement such as "for entertainment purposes" does not overcome the guideline.

Relevance to StreamTracker:

- Apple appears to be applying 1.1.6 by analogy: if metadata suggests users can stream/watch content in the app, but the app only shows availability and links, Apple may treat that as a false-feature issue.
- The strongest response is to show that the app has never promised in-app streaming, and to remove or clarify any metadata phrase Apple could read that way.

### Guideline 2.3 Accurate Metadata

Apple's 2.3 guidance is directly relevant even though the rejection cites 1.1.6:

- https://developer.apple.com/app-store/review/guidelines/

Relevant text summary:

- Customers should know what they are getting when they download an app.
- App metadata, including privacy information, description, screenshots, and previews, must accurately reflect the core experience.
- App functionality should be clear to end users and App Review.
- Marketing an app in a misleading way by promoting content or services it does not offer can trigger removal or blocking.
- App subtitles provide context, must follow metadata rules, and should not make unverifiable claims.
- App icons, screenshots, and previews are metadata surfaces too.

Relevance to StreamTracker:

- The subtitle and first sentence matter more than a later disclaimer.
- If profile "Streaming Services" preferences are visible but do not change recommendations or filtering, they can weaken the "metadata is accurate" argument.
- Screenshots/previews should show discovery, watchlist, and provider-link flows, not anything that looks like playback.

### Product Page Guidance

Apple's product page guidance:

- https://developer.apple.com/app-store/product-page/

Relevant text summary:

- Screenshots should visually communicate the app's user experience.
- The first sentence of the description is the most important because users can see it without expanding the description.
- The description should focus on the app's unique features and functionality.
- Keywords should be accurate, relevant, and should not include protected or irrelevant terms.

Relevance to StreamTracker:

- Put the no-playback/where-to-watch distinction in the first sentence, not only at the end.
- Avoid broad wording that could imply the app provides streaming content.
- Use screenshots that show search, details, watchlists, and provider links rather than splash/logo-only or poster-dominated marketing.

### App Information / Subtitle / Content Rights

Apple's App Information reference:

- https://developer.apple.com/help/app-store-connect/reference/app-information/app-information

Relevant text summary:

- Subtitle is a summary under the app name and is limited to 30 characters.
- Apps that contain, show, or access third-party content must have the necessary rights or otherwise be permitted to use it in each App Store country/region.

Relevance to StreamTracker:

- The owner-proposed subtitle "Track where to stream Movies & Shows" is likely too long.
- A shorter subtitle should emphasize tracking/availability rather than "streaming movies."
- The content-rights point remains relevant because the previous 05-23 rejection was about Disney/Pixar material.

### App Review Notes And Attachments

Apple's App Review page and App Store Connect API docs say Review Notes and attachments can provide context and documentation:

- https://developer.apple.com/app-store/review/
- https://developer.apple.com/documentation/appstoreconnectapi/app-store-review-details
- https://developer.apple.com/documentation/appstoreconnectapi/app-store-review-attachments
- https://developer.apple.com/help/app-store-connect/reference/app-review-information

Relevant text summary:

- Review Notes are not visible to customers.
- Notes can include information needed to test the app and understand non-obvious features.
- Attachments can provide specific app documentation and help prevent review delays.

Relevance to StreamTracker:

- Use Review Notes to explain that provider links open official third-party destinations and no playback occurs in StreamTracker.
- Attach a short screenshot set showing no video player, no download control, and the provider-link handoff.
- If the profile services selector remains visible, explain exactly what it does in this build.

## Comparable App Wording

These are not legal authority and do not bind Apple. They are useful wording models for a recognized App Store category.

### TV Time

Source:

- https://apps.apple.com/us/app/tv-time-track-shows-movies/id431065232

Relevant observation:

- The App Store listing opens with an explicit note that users cannot watch TV shows or movies with TV Time.
- It then describes tracking, organizing, finding where to watch, recommendations, trending content, and watchlists.

Use for StreamTracker:

- If Apple is stuck on "streaming," a first-line no-playback statement may be useful.
- The rest of the metadata still needs to match that statement.

### JustWatch

Sources:

- https://apps.apple.com/us/app/justwatch-movies-tv-shows/id979227482
- https://support.justwatch.com/article/what-is-just-watch

Relevant observation:

- JustWatch describes itself as a streaming guide that helps users find where to watch movies and shows online.
- It emphasizes legal offers and provider availability.

Use for StreamTracker:

- "Find where to watch" and "legal availability" are safer phrases than "track streaming movies."
- "Streaming guide" is an accepted product category in the market, but a small independent app may need more explicit no-playback wording than JustWatch.

### Trakt

Source:

- https://apps.apple.com/us/app/trakt-tv-shows-movies/id1514873602

Relevant observation:

- Trakt describes tracking shows/movies, discovering what is hot and where to stream, and partnering with JustWatch for direct streaming links.
- It frames streaming links as provider indexing/linking, not in-app content playback.

Use for StreamTracker:

- "Direct provider links" and "indexed services" are useful concepts.
- If StreamTracker does not have a named partner like JustWatch, avoid overclaiming and simply say links open third-party providers when available.

## Response Strategy Implications

Recommended factual posture:

- StreamTracker is a discovery, availability, and watchlist app.
- The app does not host, stream, download, or play movies or TV episodes.
- "Streaming" references are about availability from third-party providers and outbound provider links.
- Provider links open official third-party destinations when available.
- Profile service selections are saved preferences only in this build unless/until product changes make them active filters.

Recommended metadata posture:

- Change the subtitle before resubmission.
- Consider changing the first description sentence to "find where they are legally available to watch."
- Avoid making "streaming" the noun that modifies "movies & shows."
- Prefer "where to watch," "watch options," "availability," "provider links," and "watchlists."

Recommended App Review Notes posture:

- Acknowledge the exact 05-25 concern without conceding fraud or deception.
- State the metadata has been clarified to avoid any possible misunderstanding.
- State there is no video player, in-app playback, media hosting, or download feature.
- Ask Apple to identify any remaining specific metadata item or screen if they still believe the app is misleading.

Avoid:

- Calling the rejection frivolous in App Review.
- Saying "other apps do it" as an argument.
- Relying only on a disclaimer.
- Overclaiming that API data/provider links grant all rights to all third-party content.
- Leaving a future/unimplemented profile preference visible without context if it becomes part of Apple's concern.

## Open Questions Before Drafting

- What exact subtitle, promotional text, keywords, screenshots, and preview videos were live in the rejected 05-25 submission?
- Was the privacy policy updated and live before the 05-25 review?
- Did the 05-25 submission include the 05-23 Review Notes verbatim, including "does not stream, host, download, sell, or distribute video content"?
- Did the submitted screenshots include the profile page `Streaming Services` selector?
- Did the screenshots or app preview show the `Where to Stream` section or provider logos?
- Did the screenshots include large third-party artwork or provider-specific landing sections such as `Only on Disney+`?
