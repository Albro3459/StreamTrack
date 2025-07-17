# StreamTrack

## Overview
**StreamTrack** is a **React Native & TypeScript** app built with **Expo Go**. It helps users discover movies & TV shows, create watchlists, find streaming options, and even use a fun spinner to pick something to watch. It uses a **C#**/**.NET API** hosted on **AWS EC2** using [Caddy](https://github.com/caddyserver/caddy) for the reverse proxy in the backend.
 * The original idea and design for this project was created with [@jslade4](https://github.com/jslade4) and [@truclamho](https://www.linkedin.com/in/truclamho?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app) for our **Interface Design and Technology** class in ~5 days in this original [GitHub](https://github.com/Albro3459/WhatWereWatching/tree/main). However, this project has been completely rewritten by [Alex Brodsky](https://www.linkedin.com/in/brodsky-alex22/), as well as building the API and Lambda functions from scratch.

## Screen Shots
<div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 60px;">
   <img src="https://github.com/user-attachments/assets/3312ab7c-03c2-4072-b652-78143612bf43" alt="Library" height="400"/>
   <img src="https://github.com/user-attachments/assets/7ae6c02c-2262-4343-8302-c5efb9d6fe77" alt="Search" height="400"/>
   <img src="https://github.com/user-attachments/assets/15b8477c-9e0c-476e-a2b3-96c70d9f7399" alt="Spinner" height="400"/>
</div>

## Installation

#### Note:
Only the UI part of the app will work, the API needs to either be ran on your computer (some code needs to be modified, since it is made to run on a server) or on a server. 

Also, the app's content will be empty unless you run the Lambda script to fetch the content (some code needs to be modified, since it is made to run on AWS Lamda).

See API Setup below for how to get the API keys.

See the READMEs in each folder for their specific setup.

Follow these steps to set up and run Stream Track locally:

### 1. Clone the repository
```sh
git clone https://github.com/Albro3459/StreamTrack.git
```

### 2. Navigate into the project directory
```sh
cd StreamTrack/APP
```

### 3. Install dependencies
```sh
npm install
```

### 4. Install the Expo Go app on your phone
Download and install the Expo Go app from the App Store (iOS) or Google Play Store (Android).

### 5. Start the development server
```sh
npm start
```

### 6. Run the app on your device
- **On iPhone:** Scan the QR code with the iPhone Camera app.
- **On Android:** Open the Expo Go app and scan the QR code using the camera in the app.

## API Setup
The app requires connecting to two APIs.

- **[TMDB API](https://developer.themoviedb.org/reference/intro/getting-started)** – Get a **Bearer Token**.
- **[RapidAPI](https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability/playground/apiendpoint_14b2f4b9-8801-499a-bcb7-698e550f9253)** – Get an **API Key**.


<br></br>
