# App Store Review Response Draft

Use this after uploading the documentary evidence listed below in App Review Information. Do not attach API keys, secrets, backend source code, private database records, or screenshots containing credentials.

## Resolution Center Reply

Hello App Review,

Thank you for the follow-up.

We believe there may be a misunderstanding about the app's functionality. StreamTracker is a media discovery and watchlist app. It does not host, stream, download, sell, or distribute Disney/Pixar video content, or any other third-party video content.

The app displays movie and TV metadata, poster images, provider identifiers, streaming availability, prices, and provider links so users can identify titles and find where they may legally watch or purchase them from official providers. Any provider links open the official third-party destination when available; StreamTracker does not unlock or play that content in the app.

The submitted app is not affiliated with, endorsed by, sponsored by, or certified by Disney, Pixar, TMDB, Movie of the Night, RapidAPI, or any streaming provider. Disney/Pixar marks or works are not used in the app name, app icon, developer name, or app branding. Third-party names, logos, images, and metadata are used only for functional title identification, provider identification, discovery, watchlist, and legal availability purposes.

For transparency, the compiled client app calls the StreamTracker backend. The backend retrieves movie and TV metadata and image URLs from The Movie Database (TMDB), and retrieves streaming availability/provider/deep-link information from Movie of the Night's Streaming Availability API through RapidAPI. API credentials are kept server-side and are not exposed in the app build. User account identifiers, email, name, custom lists, favorites, and profile preferences are not forwarded to those content-data providers for normal content lookups.

We have included documentary evidence in App Review Information for the data sources and the app's behavior, including provider documentation and screenshots showing that the app has no video player, no download controls, and only discovery/watchlist/provider-link functionality. We have also updated the privacy policy to describe the content-data providers and data flow more explicitly.

Could you please identify the specific screen, title, image, logo, metadata item, or App Store metadata asset that App Review believes violates Guideline 5.2.1? We are happy to review any specific concern, but the current message only refers generally to "Disney/Pixar material" without identifying the disputed material.

Thank you.

## App Review Notes

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

## Attachments To Upload

- Screenshot of the app icon, app name, and App Store metadata showing StreamTracker-owned branding.
- Screenshots of the landing, search, detail, watchlist/library, and provider-link flows.
- Screenshot showing there is no in-app video playback or download control.
- Screenshot or PDF of the updated privacy policy at `https://streamtrack.gocloudlaunch.com/privacy-policy`.
- TMDB API documentation/FAQ and attribution page:
  - `https://developer.themoviedb.org/docs/faq`
  - `https://www.themoviedb.org/about/logos-attribution`
  - `https://www.themoviedb.org/api-terms-of-use`
- Evidence of TMDB API access or license status. Use account/subscription/license proof, not an API token.
- Movie of the Night Streaming Availability API documentation:
  - `https://docs.movieofthenight.com/`
  - `https://docs.movieofthenight.com/guide/images`
  - `https://docs.movieofthenight.com/resource/shows`
  - `https://docs.movieofthenight.com/resource/countries`
- Evidence of Movie of the Night/RapidAPI account or subscription access. Use account/subscription proof, not an API key.

## Do Not Say

- Do not say "other apps do it."
- Do not argue with Apple in emotional language.
- Do not say API data means there is no IP issue.
- Do not claim TMDB, RapidAPI, or Movie of the Night grants Disney/Pixar rights unless you have documentation saying that.
- Do not attach secrets, tokens, backend source code, or private user data.
