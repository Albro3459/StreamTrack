# StreamTrack

## Overview
**StreamTrack** is an app for users to discover movies & TV shows, find streaming options, and create watchlists. It is built with **React Native**, **TypeScript**, **Expo Go**, and **Firebase** for authentication. It uses a **C#**/**.NET API** hosted on **AWS EC2** using **Docker** compose & containers, as well as [Caddy](https://github.com/caddyserver/caddy) for a Reverse Proxy. It also uses an **AWS Lambda** function to fetch the popular streaming content shown on the landing page.
 * The original idea, design, and implementation of the frontend app for this project was created alongside [@jslade4](https://github.com/jslade4) and [@truclamho](https://www.linkedin.com/in/truclamho?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app) for our **Interface Design and Technology** class in ~5 days in this original [GitHub](https://github.com/Albro3459/WhatWereWatching/tree/main). However, it has since been completely rewritten by [Alex Brodsky](https://www.linkedin.com/in/brodsky-alex22/), as well as building the API and Lambda function from scratch.

## Screen Shots
<div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 60px;">
    <img height="400" alt="Landing Page" src="https://github.com/user-attachments/assets/e40721fe-2716-4fda-a3ca-c4c847fd6e3a" />
    <img height="400" alt="Info Page" src="https://github.com/user-attachments/assets/c915f9e9-4d4f-4441-84e2-4cb1035edac8" />
    <img height="400" alt="Library Page" src="https://github.com/user-attachments/assets/2c733334-2a3a-43ec-8c45-30bb28795fdf" />
</div>

## Installation

#### Note:
Only the UI part of the app will work, the API needs to either be ran on your computer (some code needs to be modified, since it is made to run on a server) or on a server. 

Also, the app's content will be empty unless you run the Lambda script to fetch the content (some code needs to be modified, since it is made to run on AWS Lamda).

See API Setup below for how to get the API keys.

See the READMEs in each of the main folders for their specific setup.

Follow these (outdated) steps to set up and run Stream Track locally:

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

- **[TMDB API](https://developer.themoviedb.org/reference/intro/getting-started)** - Get a **Bearer Token**.
- **[RapidAPI](https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability/playground/apiendpoint_14b2f4b9-8801-499a-bcb7-698e550f9253)** - Get an **API Key**.


<br></br>
