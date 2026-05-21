# Add Guests Plan

Apple's current Guideline 5.1.1(v). The relevant Apple rule is basically: if the feature is not meaningfully account-based, users need to be able to use it without login. Source: [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

Do **not** lock search. Apple called out "browsing of titles", and search is very likely part of browsing/discovery. Safer path: guest users can browse popular titles, search titles, open details, see streaming availability, and open streaming links. Account required only for saving, lists, profile/personalization, sharing, logout/account management.

**Big App Shape**
Add `Continue as guest` on [LoginPage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/LoginPage.tsx:188). Guest should route to `LandingPage`. Right now unauthenticated users are always redirected to login in [index.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/index.tsx:38), so that needs a guest state path.

The API currently requires auth globally in [Program.cs](/Users/alexbrodsky/GitHub/StreamTrack/API/Program.cs:69). Public browsing will need anonymous/public access for `Content/Search`, `Content/Info`, `Content/Popular`, `Genre/GetMain`, and `Streaming/GetMain`. Keep `User` and `List` endpoints authenticated.

Important: adding anonymous access is not enough by itself. Those public endpoints also currently check for a Firebase UID and matching user row, so remove or bypass those user checks for public browsing endpoints. They should succeed with no bearer token. `Content/Popular`, `Content/Search`, `Content/Info`, `Genre/GetMain`, and `Streaming/GetMain` should be treated as app/content data, not user data.

Guest/auth state should be simple: do not store a guest flag. If Firebase has no usable signed-in account, or if account/user data cannot be loaded, clear user-specific state and treat the app as guest instead of redirecting to login. Do not force logout. Keep public browsing working. Account-required actions should prompt with the sign-in/up modal.

For rendering, always provide a local default Favorites list for guests: `[{ listName: FAVORITE_TAB, tmdbIDs: [], isOwner: true }]`. This keeps hearts and add-to-list UI stable while all writes still prompt for auth.

When an authenticated `User` or `List` API call returns 401, clear user-specific state and render as guest. Do not call logout and do not force the Login page. If the 401 came from a user-triggered account action, show the sign-in/up modal immediately because the failed request was already account-required. If it came from startup/background cache loading, silently clear user data and continue as guest.

Use explicit return URLs for auth prompts. Do not use `router.back()` for returning from LoginPage because native auth flows and replace navigation can make history unreliable. When the modal's auth button is tapped, navigate to LoginPage with a return URL and any needed params. After sign in, return directly to that URL. After sign up, go to Profile setup first, then on Profile save use the same return URL. If the user taps `Continue as Guest` on LoginPage, return to that URL as well. If no return URL exists, default to `LandingPage`.

**Guest Handling By Place**
Landing:
Let guests browse carousel/rails and open details. Gate heart taps, add-to-list, add-to-list after long-press opens the list modal, and the `Library` button with the modal. Current user-specific spots are hearts/long-press at [LandingPage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/LandingPage.tsx:105) and [LandingPage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/LandingPage.tsx:216), plus Library at [LandingPage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/LandingPage.tsx:262).

Search:
Keep search open. Gate hearts and list actions after long-press. Search itself currently fetches with `auth.currentUser` at [SearchPage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/SearchPage.tsx:74), so that needs a public/guest-safe request path.

Info/details:
Let guests see overview, streaming links, genres, cast, recommendations. Gate `Add to List`, `Create & Add to List`, heart, and add-to-list after recommendation long-press. Main spots: [InfoPage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/InfoPage.tsx:334), [InfoPage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/InfoPage.tsx:345), [InfoPage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/InfoPage.tsx:265).

Library:
This is account-based. If a guest taps Library, show the account modal instead of navigating. If they deep-link to Library, go back to home and show the Sign In / Sign Up / Continue as Guest modal. Lists/user data exist in [LibraryPage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/LibraryPage.tsx:51).

Profile:
Prompt before editing, not on Save. If guests type profile data and only then get blocked, it feels like the app collected personal info before explaining the account requirement. Best UX: Profile opens read-only and blurred, but users can still see the options beneath. Put a prominent `Sign In / Sign Up` button over the profile body. Hide Save, Logout, Add Password Login, and Delete Account buttons for guests. Tapping anywhere in the body should not open the modal; only tapping the `Sign In / Sign Up` button should open the account modal. Inputs are at [ProfilePage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/ProfilePage.tsx:241), [ProfilePage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/ProfilePage.tsx:264), and Save is [ProfilePage.tsx](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/ProfilePage.tsx:294).

Lists:
Gate all list writes: create list, delete list, add/remove content. The shared core is [listHelper.ts](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/helpers/StreamTrack/listHelper.ts:40) and [listHelper.ts](/Users/alexbrodsky/GitHub/StreamTrack/APP/app/helpers/StreamTrack/listHelper.ts:116). For long-press, show the list modal first, then on tap of the heart, a list, or the create list button, show the account modal. If the guest has no lists, still show the heart and create-list button in the list modal; both should open the create account modal. For the Content Details plus button, show account modal immediately.

**Modal Copy**
Title: `Sign in/up to continue`

Body: `Lists, favorites, and profile preferences are saved to your account. You can keep browsing as a guest.`

Buttons: `Sign In / Sign Up`, `Continue as Guest`

Also include X, background tap close, and make `Continue as Guest` just dismiss the modal.

**API Cost Control**
None
