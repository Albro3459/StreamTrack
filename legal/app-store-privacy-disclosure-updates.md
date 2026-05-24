# App Store Privacy Disclosure Updates

Date: 2026-05-24

Source reviewed: `legal/app-store-current-privacy-disclosures.md`.

Apple's App Privacy guidance says the label must disclose data collected by the app or third-party partners, even when used only for app functionality. Apple defines "Search History" as searches performed in the app, "Other User Content" as other user-generated content, and "Other Data Types" as data not covered by another category.

Primary Apple source:

- `https://developer.apple.com/app-store/app-privacy-details/`
- `https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy`

## Current Disclosure

The current App Store privacy label discloses:

- Name: linked to user, used for app functionality.
- Email Address: linked to user, used for app functionality.
- User ID: linked to user, used for app functionality.
- Crash Data: not linked to user, used for app functionality.

## Recommended Updates

Keep the current disclosures, then add or update the following before resubmission.

### Contact Info

Name:

- Keep: Data Linked to You.
- Keep: Used for App Functionality.
- Add: Product Personalization, if the App Store Connect form allows multiple purposes, because the app displays the user's first name in the user experience.

Email Address:

- Keep: Data Linked to You.
- Keep: Used for App Functionality.
- Do not mark Tracking.

### Identifiers

User ID:

- Keep: Data Linked to You.
- Keep: Used for App Functionality.
- Do not mark Tracking.

### User Content

Add Other User Content for:

- Custom list names.
- Favorites.
- Saved movies and TV shows.
- Watchlists.
- Shared list membership.

Recommended answers:

- Data Linked to You: Yes.
- Purpose: App Functionality.
- Tracking: No.

### Other Data Types

Add Other Data Types for:

- Favorite genres.
- Favorite streaming services.
- Other account-level profile preferences not captured by Name, Email Address, or User ID.

Recommended answers:

- Data Linked to You: Yes.
- Purpose: App Functionality.
- Purpose: Product Personalization, if these preferences customize content or recommendations.
- Tracking: No.

### Search History

Add Search History as the conservative App Review answer because the app sends search terms off-device to the StreamTracker backend and then to TMDB to fulfill search requests.

Recommended default answers:

- Purpose: App Functionality.
- Tracking: No.

Linking answer:

- Choose Data Not Linked to You only if backend, CDN, provider, and log retention are configured so search terms are not stored with account identifiers, auth tokens, IP-derived identity, or other identifiers.
- Choose Data Linked to You if search terms are retained in logs, analytics, support tooling, or databases with account identifiers, auth tokens, IP-derived identity, or other identifiers.

Given the current app sends an auth header during logged-in search requests, verify server/proxy logging before choosing the final linked/not-linked answer.

### Diagnostics

Crash Data:

- Keep: Data Not Linked to You, if crash reports are not tied to account identity.
- Keep: Used for App Functionality.
- Do not mark Tracking.

Add Performance Data only if Expo, Apple, Firebase, or another tool collects launch time, hang rate, energy use, performance traces, or similar diagnostics in a way you can access.

## Tracking

Recommended answer: No, assuming the app has no ads and does not link app data with third-party data for targeted advertising, advertising measurement, or data broker sharing.

## Privacy Links

Privacy Policy URL:

- Keep: `https://streamtrack.gocloudlaunch.com/privacy-policy`

User Privacy Choices URL:

- Optional. Recommended if App Store Connect allows it without review friction.
- Use the same privacy policy URL only if you are comfortable treating the Contact/Data Retention section as the user choices page.
- Better long-term option: create a short dedicated page for account deletion, data deletion, and privacy requests.

## App Review Notes For Privacy

Use this wording in App Review Notes if Apple asks why the label changed:

StreamTracker's privacy disclosures were updated to more explicitly describe account data, watchlists/favorites, search requests, and backend content-data providers. Search text and content identifiers may be processed through the StreamTracker backend to retrieve movie/TV metadata from TMDB and availability data from Movie of the Night/RapidAPI. StreamTracker does not use this data for third-party advertising or tracking.
