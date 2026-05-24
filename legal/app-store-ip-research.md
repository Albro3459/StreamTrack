# App Store IP Review Research Memo

Date: 2026-05-23

Scope: Research for StreamTrack's App Store rejection under Guideline 5.2.1, where Apple objected to review-visible Disney/Pixar material.

## Short Version

StreamTrack's strongest legal framing is:

- StreamTrack is a media discovery and watchlist app. It does not host, stream, download, sell, or distribute movie/TV video content.
- The app uses title metadata, poster/backdrop images, provider names/logos, and streaming availability to identify works and route users to legal viewing options.
- U.S. copyright law protects creative expression, including poster artwork and some written descriptions, but does not protect facts, ideas, systems, names, titles, or short phrases. Raw availability facts and title metadata are much safer than poster art or logos.
- Fair use case law gives meaningful support for search, indexing, reference, thumbnail, and contextual identification uses, especially where the use is transformative, limited, and does not substitute for the underlying copyrighted work.
- Trademark law generally targets consumer confusion about source, sponsorship, affiliation, or endorsement. Nominative use principles support using marks to identify the actual title, studio, or service, if only the necessary amount is used and the app does nothing to imply endorsement.
- Apple review policy is stricter and more operational than a court's fair use analysis. Even if a use is legally defensible, Apple can ask for documentation or reject under its own guidelines unless the app notes, attribution, screenshots, and API rights are clear.

## StreamTrack Facts Visible In The Repo

Likely review-visible IP surfaces:

- Landing sections can include "Popular on Disney+" and "Only on Disney+" from `API/Controllers/ContentController.cs`.
- Movie and TV posters/backdrops are rendered in `APP/app/LandingPage.tsx`, `APP/app/SearchPage.tsx`, and `APP/app/InfoPage.tsx`.
- Provider logos are rendered on the info page through `SvgUri` from `streamingOption.streamingService.darkLogo`.
- Streaming service seed data includes a Disney+ provider name and logo URLs in `API/Infrastructure/StreamTrackDbContext.cs`.
- TMDB image URLs are generated from TMDB poster/backdrop paths in `API/Service/APIService.cs` and `Lambda/helpers/tmdbAPIHelper.ts`.
- The streaming availability provider appears to be Movie of the Night's Streaming Availability API through RapidAPI or its own developer platform.

Practical meaning: Apple's complaint may target a poster/backdrop, a Disney+ service logo, a Disney/Pixar title, or a section label that makes the app look like it is promoting a Disney-branded catalog. The rejection text does not identify which one.

## Apple Policy Layer

Apple App Store Review Guideline 5.2.1 says apps should not use protected third-party material such as trademarks or copyrighted works without permission, and apps should be submitted by the rights owner or licensee of the relevant IP rights.

Apple Guideline 5.2.2 says that if an app uses, accesses, monetizes, or displays content from a third-party service, the app must be specifically permitted to do so under that service's terms.

Apple Guideline 5.2.3 focuses on illegal file sharing and saving, converting, or downloading media from third-party sources without explicit authorization. StreamTrack's no-download/no-playback posture is relevant because the app is closer to a legal guide than a media access tool.

Apple's App Review page says that if partnership documentation or authorization is needed, the developer can attach files in App Store Connect and provide descriptions or links in Review Notes.

Research implication:

- Apple is asking a review-process question, not deciding a full U.S. fair use case.
- A legally sound response should not only say "fair use." It should show how the app works, show provider/API permission, show no source confusion, show legal outbound links, and ask Apple to identify the exact disputed asset.
- If Apple asks for documentary evidence, useful documents are API terms, API account/subscription proof, attribution screenshots, app screenshots showing no video playback, and a concise rights explanation.
- App Store screenshots and preview videos are a special risk surface because Apple reviews them as marketing metadata. A poster or provider logo in an in-app functional screen is easier to defend than the same artwork enlarged as promotional App Store art.

Sources:

- Apple App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple App Review notes/attachments guidance: https://developer.apple.com/app-store/review/
- Apple screenshot/app preview upload guidance: https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots

## Review Process Observations

Public developer reports are not binding sources, but they show a pattern: Apple often rejects screenshots, icons, or app previews that include third-party artwork or logos unless the developer supplies documentation or removes the material. The pattern matters because the rejection against StreamTrack uses the same operational language: "attach documentary evidence" or remove the content.

Practical implication:

- Treat the in-app experience and App Store metadata as two different review surfaces.
- If Apple flagged the build, the disputed material may be inside the app.
- If Apple flagged metadata, App Store screenshots/previews may be enough to trigger the rejection even if the in-app use is legally stronger.
- The next response should ask for the exact screen/asset, because Apple's current message does not say whether the problem is a poster, a provider logo, a service section title, screenshots, or metadata.

Examples and sources:

- Developers have reported 5.2.1-style rejections for protected album cover artwork in app icons, screenshots, and previews: https://www.reddit.com/r/iOSProgramming/comments/1kmaff6
- Developers have reported similar issues with Spotify album artwork from an API, where Apple asked for rights documentation: https://www.reddit.com/r/iOSProgramming/comments/1o3vm1g
- Developers have reported movie poster concerns in App Store screenshots even where comparable movie apps exist: https://www.reddit.com/r/iOSProgramming/comments/1t561i7/can_i_use_real_movie_posters_in_app_store/

## Copyright Law

### Protected Rights

Under 17 U.S.C. 106, copyright owners have exclusive rights including reproduction, derivative works, distribution, public performance, and public display. Movie posters, production stills, key art, photos, and some written descriptions are usually copyrighted expression.

Under U.S. Copyright Office guidance, copyright does not protect facts, ideas, systems, or methods of operation, although it may protect the expression of those things. Copyright Office guidance also says names, titles, and short phrases generally are not protected by copyright.

For StreamTrack:

- Safer: title names, runtime, release year, genre facts, cast names, provider availability facts, service names used as service identifiers.
- Higher risk: poster art, backdrop art, branded provider logos, trailer clips, long copied descriptions, app screenshots dominated by third-party key art.
- Intermediate: remote image URLs and embedded images from API/CDN sources. StreamTrack may not store image files itself, but the app still causes third-party images to be displayed to users, which is enough for Apple review to ask for rights documentation.

Sources:

- 17 U.S.C. 106: https://www.law.cornell.edu/uscode/text/17/106
- U.S. Copyright Office FAQ, copyright in general: https://www.copyright.gov/help/faq/faq-general.html
- U.S. Copyright Office FAQ, names/titles/facts: https://www.copyright.gov/help/faq/faq-protect.html
- U.S. Copyright Office Circular 33: https://www.copyright.gov/circs/circ33.pdf

### Non-Hosting And The Server Test

StreamTrack appears to store poster/logo URLs and let the client load images from TMDB or Movie of the Night/CDN URLs. That supports the factual statement "StreamTrack does not host the poster images or video content."

However, this is not a complete legal answer:

- In the Ninth Circuit, cases around inline linking and embedding apply a "server test," under which embedding an image hosted elsewhere may not directly violate the public display right because the defendant does not store the image.
- The server test is jurisdiction-specific and contested. It is strongest for web embedding, not necessarily a native app that intentionally renders remote artwork.
- Apple review is not obligated to apply the server test. For App Review, the practical question remains whether the app "includes" or "displays" third-party content under Apple's guidelines.

Sources:

- Hunley v. Instagram, Ninth Circuit server test opinion: https://law.justia.com/cases/federal/appellate-courts/ca9/22-15293/22-15293-2023-07-17.html
- Summary of Hunley and the server test: https://www.dwt.com/insights/2023/08/server-test-instagram-case-ninth-circuit

### Fair Use Framework

17 U.S.C. 107 provides the fair use framework. Courts consider:

- Purpose and character of the use, including commerciality and whether the use is transformative.
- Nature of the copyrighted work.
- Amount and substantiality used.
- Effect on the potential market for or value of the copyrighted work.

The U.S. Copyright Office says fair use must be decided case by case and that only a federal court can ultimately determine whether a specific use is fair use.

For StreamTrack:

- Purpose: identification, discovery, indexing, watchlist organization, and legal routing to providers. This helps the fair use argument.
- Nature: posters and artwork are creative. This hurts the argument for poster/backdrop use more than factual metadata.
- Amount: using entire poster art can hurt, but using resized thumbnails/posters for identification can help if the size, context, and resolution are limited.
- Market effect: the app does not substitute for movies, TV episodes, posters as collectibles, or streaming services. It can direct demand to authorized viewing options. This helps.

Sources:

- 17 U.S.C. 107: https://www.law.cornell.edu/uscode/text/17/107
- U.S. Copyright Office fair use overview: https://www.copyright.gov/fair-use/more-info.html
- U.S. Copyright Office fair use FAQ: https://www.copyright.gov/help/faq/faq-fairuse.html

## Fair Use Cases Relevant To Search, Discovery, And Identification

These are not identical to StreamTrack, but they support the concept that copying or displaying copyrighted material can be fair when used for search, indexing, reference, historical context, or identification rather than as a substitute for the original market.

### Perfect 10 v. Amazon / Google

The Ninth Circuit treated Google's use of thumbnail images in image search as highly transformative and fair use. The court focused on the public value of image search and the different purpose of thumbnails from the original images.

Relevance:

- Helpful for poster thumbnails in search/discovery lists.
- Stronger when images are small, contextual, and tied to search/reference.
- Less helpful for large hero art or marketing screenshots where the art becomes the main expressive attraction.

Source:

- Perfect 10 v. Amazon.com, 508 F.3d 1146: https://www.bitlaw.com/source/cases/copyright/Perfect-10.html

### Kelly v. Arriba Soft

The Ninth Circuit held that an image search engine's thumbnail use could be fair use because it served a different function from the original photos. The case is often paired with Perfect 10 for search-thumbnail reasoning.

Relevance:

- Helpful for small poster thumbnails used to help users identify search results.
- Caution: direct display of full-size images carried more risk in the case history.

Source:

- EFF case summary: https://www.eff.org/cases/kelly-v-arriba-soft

### Authors Guild v. Google

The Second Circuit held that Google Books' copying and snippet display for search was fair use. The snippet display was limited and helped users decide whether a book was relevant without replacing the book.

Relevance:

- Helpful for indexing/search and limited previews.
- Supports the idea that a tool can copy/index copyrighted material to help users discover and find lawful access to the original.

Source:

- Authors Guild v. Google, 804 F.3d 202: https://law.justia.com/cases/federal/appellate-courts/ca2/13-4829/13-4829-2015-10-16.html

### Bill Graham Archives v. Dorling Kindersley

The Second Circuit found fair use where a book reproduced Grateful Dead concert poster images at reduced size in a historical timeline. The use changed the purpose from promotion to historical reference and context.

Relevance:

- Helpful because it involved poster artwork and a commercial product.
- Supports use of reduced poster art for identification/context rather than original promotional purpose.

Source:

- Case PDF hosted by Berkeley Law: https://www.law.berkeley.edu/archive/files/Bill_Graham_case.pdf

## Modern Fair Use Limits

Fair use is not automatic. Recent cases emphasize that courts look closely at the specific use and market.

### Andy Warhol Foundation v. Goldsmith

In 2023, the Supreme Court held that the first fair use factor weighed against the Andy Warhol Foundation's commercial magazine licensing use because it shared a similar licensing purpose with the original photograph.

StreamTrack risk lesson:

- Do not frame third-party posters as app marketing art, promotional hero material, or standalone aesthetic value.
- Stronger framing is functional identification in search/watchlist/availability flows.

Source:

- Supreme Court case summary/opinion: https://supreme.justia.com/cases/federal/us/598/21-869/

### Hachette v. Internet Archive

In 2024, the Second Circuit rejected the Internet Archive's fair use defense for scanning and lending complete books online without authorization.

StreamTrack risk lesson:

- Fair use weakens when the product provides substitute access to the original work.
- StreamTrack's no-streaming/no-download/no-video-access posture matters.

Source:

- AP summary of final posture after appeal: https://apnews.com/article/e26a88496202b396015c555dca429b9b

## Trademark Law

### Core Rule

The USPTO describes trademark infringement as unauthorized use of a mark in connection with goods or services in a manner likely to cause confusion, deception, or mistake about source.

For StreamTrack:

- Using "Disney+" as the name of an actual streaming service in an availability list is different from branding StreamTrack as Disney/Pixar-affiliated.
- Risk increases if Disney/Pixar marks or logos appear in the app icon, app name, subtitle, promotional screenshots, hero banners, or default sections in a way that suggests affiliation or sponsorship.

Sources:

- USPTO, trademark infringement: https://www.uspto.gov/page/about-trademark-infringement
- USPTO, likelihood of confusion: https://www.uspto.gov/trademarks/search/likelihood-confusion

### Nominative Fair Use

Nominative fair use is a judicial doctrine allowing use of another party's mark to identify that party's actual product or service. The common three-part formulation asks whether:

- The product or service is not readily identifiable without the mark.
- Only so much of the mark is used as reasonably necessary.
- The user does nothing to suggest sponsorship or endorsement.

For StreamTrack:

- Text service names are usually cleaner than logos because text is often the minimum necessary identifier.
- Logos can still be defensible in context, but are easier for Apple to flag because they are more branded and more visually prominent.
- A disclaimer helps but does not cure a confusing UI by itself.
- Marketplace and search-guide cases are useful by analogy: a service can use a trademark to identify genuine third-party goods or services if the use does not imply sponsorship or affiliation.

Sources:

- New Kids nominative fair use summary: https://legalclarity.org/what-is-nominative-fair-use-in-trademark-law/
- Toyota v. Tabari PDF: https://www.balough.com/wp-content/uploads/2019/01/Toyota-Motor-Sales-U.S.A.-v-Farzad-Tabari-and-Lisa-Tabari.pdf
- Tiffany v. eBay, nominative use discussion: https://law.justia.com/cases/federal/appellate-courts/ca2/08-3947/08-3947-cv_opn-2011-03-27.html

### Modern Trademark Limit

In Jack Daniel's v. VIP Products, the Supreme Court held that a special First Amendment/Rogers threshold does not apply when a mark is used as a source identifier for the defendant's own goods.

StreamTrack risk lesson:

- Do not use Disney/Pixar/provider marks as StreamTrack branding.
- Use them only to identify the actual third-party service or title/provider relationship.

Source:

- Jack Daniel's v. VIP Products: https://www.law.cornell.edu/supremecourt/text/22-148

### Disney/Pixar-Specific Rights

Disney's public Terms of Use say Disney products, including movies, TV shows, trailers, images, and artwork, are copyrighted, patented, or trademarked property of Disney or its licensors. Disney+ is also a registered trademark for streaming and software-related goods/services.

This does not defeat fair use or nominative use by itself. It does explain why Apple reviewers treat Disney/Pixar as a sensitive IP category and ask for documentary evidence.

For StreamTrack:

- Do not imply Disney/Pixar endorsement, sponsorship, partnership, or official status.
- Do not use Disney/Pixar marks in StreamTrack's app name, icon, subtitle, developer name, or marketing headline.
- Provider names and title names should be presented as factual identifiers.
- Provider logos should be visually subordinate to StreamTrack branding and functional context.

Sources:

- Disney Terms of Use: https://disneytermsofuse.com/english/
- Disney+ USPTO listing: https://uspto.report/TM/88411636

## API And Data Provider Rights

### TMDB

TMDB documentation says the API is for developers who want to use movie/TV/person images and/or data in an application. TMDB's FAQ says its API is free for non-commercial purposes with attribution and that commercial projects need a commercial license. TMDB requires use of its attribution notice in an About/Credits type section. TMDB also states that it does not claim ownership of images or data in the API.

TMDB's public site terms are stricter than the short FAQ. They describe the site/services as personal, non-commercial unless otherwise authorized, and point commercial/API usage to TMDB's API Terms of Use. The terms also restrict building businesses, search engines, recommendation systems, indexes, or commercial uses around TMDB materials unless expressly authorized. This is an API-license issue separate from fair use.

For StreamTrack:

- TMDB documentation helps show Apple that the app is using a legitimate API source and can satisfy TMDB's service terms if attribution and license status are correct.
- TMDB documentation does not by itself prove Disney/Pixar authorized every poster, because TMDB says it does not own the images/data.
- If StreamTrack is commercial by TMDB's definition, the final Apple packet should verify whether a commercial TMDB license is required or already obtained.
- The strongest App Review packet should include either commercial-license proof, written confirmation from TMDB, or a specific explanation why the current TMDB use is permitted under the applicable API terms.
- The app should not use TMDB as generic image hosting for advertising, banners, or decorative promotional graphics. Use should stay tied to title identification and metadata display.

Sources:

- TMDB FAQ, attribution, commercial API, legal notice: https://developer.themoviedb.org/docs/faq
- TMDB logos and attribution page: https://www.themoviedb.org/about/logos-attribution
- TMDB site Terms of Use: https://www.themoviedb.org/terms-of-use
- TMDB API Terms of Use: https://www.themoviedb.org/api-terms-of-use
- TMDB image basics: https://developer.themoviedb.org/docs/image-basics
- TMDB finding data/search: https://developer.themoviedb.org/docs/finding-data

### Movie Of The Night Streaming Availability API

Movie of the Night's Streaming Availability API documentation says it provides streaming availability information for movies and series, including services such as Netflix, Disney+, Apple TV, Max, and Hulu across 66 countries. Its open API description says streaming options include service info and deep links.

For StreamTrack:

- This supports the "legal availability/routing" narrative.
- The API docs expressly describe show images, including vertical posters, horizontal posters, vertical backdrops, and horizontal backdrops. They also describe service/addon logos for light theme, dark theme, and white logo variants.
- The countries/services docs say service details include names, logos, homepages, supported streaming types, and addon/channel information.
- The shows docs say streaming options include service info, deep links, video quality, audio/subtitle data, and prices for rental/buy options.
- The final Apple packet should include the provider's terms, account/subscription proof, and a concise explanation that streaming links route to official provider destinations and do not provide in-app video access.

Sources:

- Streaming Availability API docs: https://docs.movieofthenight.com/
- Streaming Availability API image docs: https://docs.movieofthenight.com/guide/images
- Streaming Availability API shows docs: https://docs.movieofthenight.com/resource/shows
- Streaming Availability API countries docs: https://docs.movieofthenight.com/resource/countries
- Movie of the Night developer platform: https://developers.movieofthenight.com/
- OpenAPI repo summary: https://github.com/movieofthenight/streaming-availability-api

### RapidAPI

RapidAPI is a hub that lets API consumers connect to third-party APIs through a single marketplace/account. Its public docs describe API consumers, API providers, usage dashboards, and subscriptions. Rapid also has an IP enforcement process for reports from rights owners.

For StreamTrack:

- A RapidAPI subscription proves access to the API gateway, not necessarily a license from every underlying movie studio or streaming provider.
- The stronger evidence is the actual API provider's docs/terms plus proof of subscription/account status.
- If the API is consumed through RapidAPI, include both RapidAPI subscription evidence and Movie of the Night provider documentation.

Sources:

- RapidAPI overview: https://docs.rapidapi.com/docs/what-is-rapidapi
- RapidAPI IP issues page: https://docs.rapidapi.com/docs/intellectual-property-issues

## Modern App Store Comparables

These do not prove StreamTrack must be approved, but they show the App Store has an established category of apps that display movie/TV metadata, posters, provider availability, and legal viewing links.

### JustWatch

JustWatch's App Store listing describes it as a streaming guide with legal offers, 4,500+ providers, movie/TV search, trailers, synopsis, cast, ratings, VOD offers, and watchlists. JustWatch's public site lists services including Disney Plus.

Relevance:

- Closest market analogue.
- Their public language emphasizes legal offers and finding where to watch.
- They likely have stronger commercial documentation/partnerships than a small independent app.

Sources:

- App Store listing: https://apps.apple.com/us/app/justwatch-movies-tv-shows/id979227482
- JustWatch support, "What is JustWatch?": https://support.justwatch.com/article/what-is-just-watch
- JustWatch website: https://www.justwatch.com/

### Letterboxd

Letterboxd's App Store listing includes browsing film info, cast and crew, reviews/lists, watchlists, and streaming-service filters powered by JustWatch. It also offers custom posters/backdrops for paid Patron users.

Relevance:

- Shows App Store acceptance of a film catalog/social app that uses film metadata and poster/backdrop concepts.
- Its streaming-service filtering appears to rely on JustWatch.

Source:

- App Store listing: https://apps.apple.com/us/app/letterboxd/id1054271011

### Trakt

Trakt's App Store listing says it indexes over 1 million shows and movies, lets users track/watchlist content, imports metadata from IMDb/Plex/Letterboxd/TV Time, and partners with JustWatch for direct streaming links.

Relevance:

- Another App Store example of metadata indexing plus "where to stream" functionality.
- Strong public phrasing: community tracking plus legal streaming links.

Source:

- App Store listing: https://apps.apple.com/us/app/trakt/id1514873602

### TV Time

TV Time's App Store listing says users cannot watch TV shows or movies in the app; the app tracks shows/movies, helps users find where to watch, and provides recommendations.

Relevance:

- Useful wording model for StreamTrack: explicit "cannot watch" language reduces confusion.

Source:

- App Store listing: https://apps.apple.com/us/app/tv-time-tv-show-tracker-for-tv-fans-tvshow-time/id431065232

### Watchmode

Watchmode's API site says it provides streaming availability data and links/deeplinks, but does not provide direct access to copyrighted streaming content; subscriptions to streaming services are required.

Relevance:

- Good model language for distinguishing availability metadata from content distribution.

Source:

- Watchmode API site: https://api.watchmode.com/

### Additional Category Comparables

Sofa, Callsheet, Queue, and Add To Watchlist are additional public examples of apps/sites in the same broad category: organizing media, searching movie/TV metadata, and helping users decide what to watch or where to watch it. They are weaker legal comparables than JustWatch because their public documentation may not expose rights/partner details, but they help establish that media-reference and watchlist apps are a recognized category.

One App Store listing for a poster-identification app uses especially relevant public wording: it says poster images are used for identification, educational, and informational reference, and that the app is independent and not affiliated with studios or rights holders. This is not legal proof, but it is useful phrasing to consider.

Sources:

- Sofa App Store listing: https://apps.apple.com/us/app/sofa-downtime-organizer/id1276554886
- Callsheet App Store listing: https://apps.apple.com/us/app/callsheet-find-cast-crew/id1672356376
- Queue website: https://www.queue.co/
- Add To Watchlist website: https://addtowatchlist.app/
- Poster Identifier App Store listing: https://apps.apple.com/us/app/poster-identifier/id6748276142

## UI Rights Risk Matrix

| Surface | Legal posture | Apple-review risk | Notes |
| --- | --- | --- | --- |
| Title text, release year, runtime, genres, cast | Mostly factual metadata; titles/names generally not copyrightable | Low | Still avoid confusing trademarks in app branding. |
| Provider names such as Disney+ or Netflix | Nominative identification of actual services | Low to medium | Text-only is easier to defend than logos. |
| Provider logos | Trademark/logo use for identification | Medium | Use only in functional "where to watch" context; keep subordinate; add no-affiliation disclaimer. |
| Search/list poster thumbnails | Strongest fair use posture for images | Medium | Best analogy to search/index thumbnail cases. |
| Detail-page poster | Functional identification but larger/full artwork | Medium to high | Stronger if tied to title details and availability; weaker if purely decorative. |
| Landing carousel backdrops | More promotional/expressive | High | Apple may see this as app promotion using third-party key art. |
| App Store screenshots/previews with real posters/logos | Marketing metadata using third-party art | High | Strong candidate for Apple rejection even if in-app use is defensible. |
| In-app video playback/download | Direct media access/distribution | Very high | StreamTrack should emphasize this does not exist. |
| Deep links to official provider pages | Legal routing to authorized services | Low to medium | Strong if links go to official services and no content is unlocked in-app. |
| "Popular on Disney+" section names | Factual provider availability/category label, but brand-prominent | Medium | Text may be defensible; Apple may read it as branded promotion. |

## Best Research-Backed Position

The researched position should be:

StreamTrack is not distributing Disney/Pixar works. It is an informational discovery and watchlist app that displays limited title-identification metadata, poster/provider identifiers, and legal availability/deep-link information from third-party APIs so users can find where to watch or purchase content from official providers. The use is functional and referential, not source branding, not a substitute for the original movies/TV shows, and not a replacement market for poster art. The app should provide attribution and API-rights documentation, and should ask Apple to identify the specific asset or screen if App Review still believes a particular item is infringing.

Avoid as the primary argument:

- "Other apps do it."
- "It comes from an API, so it cannot infringe."
- "Fair use" without applying the four factors.
- "Disney is only an example" without asking Apple to identify the exact disputed asset.

Use as the primary argument:

- "Legal streaming guide/watchlist."
- "No hosting, streaming, downloading, selling, or distributing video content."
- "Functional identification and availability metadata."
- "Outbound links/deep links to official providers."
- "No affiliation, endorsement, or source confusion."
- "API terms and attribution are documented."
- "Please identify the specific screen, title, image, logo, or metadata item."

## Evidence To Gather Before The Apple Response

- Screenshot of App Store metadata showing the app name/icon/subtitle are StreamTrack-owned and not Disney/Pixar/provider branded.
- Screenshots showing no in-app movie/TV playback, no download controls, and no pirated content access.
- Screenshot of an About/Credits screen with TMDB attribution. If missing, add it before resubmission.
- TMDB API terms/FAQ link and proof of API account/license status. If the app is commercial under TMDB's definition, verify whether a commercial license is required.
- Movie of the Night Streaming Availability API docs/terms and proof of account/subscription.
- Screenshots showing provider links open official provider destinations when available.
- A short internal description of each third-party source and exactly what fields are used: title facts, poster URLs, backdrop URLs, provider names/logos, availability data, deep links.

## Open Legal Questions For Counsel

- Does StreamTrack's business model make it "commercial" under TMDB's API terms?
- Does TMDB image use plus attribution satisfy API permission for App Store review, even though TMDB disclaims ownership of images/data?
- Is use of full-size vertical posters and large horizontal backdrops still fair in hero/detail contexts, or should the legal position distinguish thumbnails/search from larger detail-page images?
- Are provider logos necessary for nominative identification, or should the app rely on service names plus generic icons if Apple keeps objecting?
- Do App Store screenshots or onboarding screens use third-party artwork in a more promotional way than the in-app functional context?

## Source Index

Apple:

- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Review page and Review Notes/attachments guidance: https://developer.apple.com/app-store/review/

Copyright:

- 17 U.S.C. 106: https://www.law.cornell.edu/uscode/text/17/106
- 17 U.S.C. 107: https://www.law.cornell.edu/uscode/text/17/107
- Copyright Office fair use overview: https://www.copyright.gov/fair-use/more-info.html
- Copyright Office fair use FAQ: https://www.copyright.gov/help/faq/faq-fairuse.html
- Copyright Office copyright FAQ: https://www.copyright.gov/help/faq/faq-general.html
- Copyright Office works not protected FAQ: https://www.copyright.gov/help/faq/faq-protect.html
- Copyright Office Circular 33: https://www.copyright.gov/circs/circ33.pdf

Copyright cases:

- Perfect 10 v. Amazon/Google: https://www.bitlaw.com/source/cases/copyright/Perfect-10.html
- Kelly v. Arriba Soft summary: https://www.eff.org/cases/kelly-v-arriba-soft
- Authors Guild v. Google: https://law.justia.com/cases/federal/appellate-courts/ca2/13-4829/13-4829-2015-10-16.html
- Bill Graham Archives v. Dorling Kindersley: https://www.law.berkeley.edu/archive/files/Bill_Graham_case.pdf
- Warhol v. Goldsmith: https://supreme.justia.com/cases/federal/us/598/21-869/
- Hachette v. Internet Archive final posture: https://apnews.com/article/e26a88496202b396015c555dca429b9b

Trademark:

- USPTO trademark infringement: https://www.uspto.gov/page/about-trademark-infringement
- USPTO likelihood of confusion: https://www.uspto.gov/trademarks/search/likelihood-confusion
- New Kids nominative fair use summary: https://legalclarity.org/what-is-nominative-fair-use-in-trademark-law/
- Toyota v. Tabari PDF: https://www.balough.com/wp-content/uploads/2019/01/Toyota-Motor-Sales-U.S.A.-v-Farzad-Tabari-and-Lisa-Tabari.pdf
- Jack Daniel's v. VIP Products: https://www.law.cornell.edu/supremecourt/text/22-148

API providers and comparables:

- TMDB FAQ: https://developer.themoviedb.org/docs/faq
- TMDB image basics: https://developer.themoviedb.org/docs/image-basics
- TMDB finding data/search docs: https://developer.themoviedb.org/docs/finding-data
- Streaming Availability API docs: https://docs.movieofthenight.com/
- Movie of the Night developer platform: https://developers.movieofthenight.com/
- Movie of the Night OpenAPI repo: https://github.com/movieofthenight/streaming-availability-api
- Watchmode API site: https://api.watchmode.com/
- JustWatch App Store listing: https://apps.apple.com/us/app/justwatch-movies-tv-shows/id979227482
- JustWatch support: https://support.justwatch.com/article/what-is-just-watch
- Letterboxd App Store listing: https://apps.apple.com/us/app/letterboxd/id1054271011
- Trakt App Store listing: https://apps.apple.com/us/app/trakt/id1514873602
- TV Time App Store listing: https://apps.apple.com/us/app/tv-time-tv-show-tracker-for-tv-fans-tvshow-time/id431065232
