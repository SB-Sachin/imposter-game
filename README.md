# 🕵️‍♂️ Impostor: Multiplayer Social Deduction Game

> A modern, real-time, web-based party game designed to be played in the same room with friends using your phones. Inspired by classic social deduction games, players must figure out who among them is completely clueless about the secret word.

Built with **React**, **Vite**, and **Firebase Realtime Database**, this application features a seamless, app-like mobile experience with instantaneous screen syncing across devices.

---

## ✨ Key Features

### 📱 Real-Time Multiplayer & Pass-and-Play Hybrid
* **Instant Sync:** Built on Firebase Realtime Database. When the Host advances the game, starts a timer, or changes a setting, every connected phone instantly updates without needing to refresh.
* **Smart Device Tracking:** The app generates a unique fingerprint for each browser. This allows for a hybrid of "Multiplayer" and "Pass-and-Play"—three friends can be on their own phones, while two other friends share a single iPad.
* **Secure Role Viewing:** Because the app knows which device "owns" which player, Player A cannot tap Player B's name to peek at their secret word. 

### 👑 Host Privileges & Dynamic Lobbies
* **4-Letter Room Codes:** Simple, familiar lobby joining system.
* **Host Controls:** Only the creator of the room (the Host) can start the game, advance rounds, or change game settings. Client phones display a "Waiting for Host..." UI.
* **Dynamic Player Counting:** The lobby dynamically adapts limits based on how many players have entered their names.

### 🎨 App-Like Mobile UI
* **No App Store Required:** Built as a pure web app, but feels native.
* **iOS Optimized:** Inputs are sized to precisely `16px` and buttons use `touch-action: manipulation` to completely prevent the annoying iOS Safari "double-tap-to-zoom" behavior.
* **Sleek Custom Scrollbars:** Transparent, modern scrollbars replace the bulky default browser bars.
* **Fluid Animations:** Custom CSS keyframes provide buttery smooth fade-ins, scale-bounces, and urgent pulsing timers.

---

## ⚙️ Game Mechanics & Settings

The game includes a highly customizable settings menu that dictates how the round plays out.

### 🕵️ Impostor Allocation Modes
Customize exactly how the Impostors are chosen depending on the vibe of the group:
1. **Fixed:** Always exactly *X* amount of Impostors (Slider dynamically caps at `Total Players - 1`).
2. **Balanced (Random):** Calculates the fairest number of Impostors based on lobby size (roughly 25% of players).
3. **Chaos (Random):** Any number of Impostors is possible. In a 6-player game, there could be 0 Impostors, or 6 Impostors! Pure psychological terror.
4. **Custom Range (Random):** Set a minimum and maximum bound (e.g., "Between 1 and 3 Impostors").

### 🧩 Gameplay Modifiers
* **Show Impostor Count:** Toggle whether the civilians know exactly how many Impostors they are hunting.
* **Show Category to Impostor:** Toggle whether the Impostor is given the category (e.g., "Animals") to help them bluff.
* **Impostors Know Each Other:** If there are multiple Impostors, toggle whether they are told who their partners are during the Reveal Phase.

### 📚 Extensive Word Library
Includes 15+ built-in categories (Food, Geography, Mythology, Tech, etc.) with over 400 carefully curated secret words. The Host can toggle specific categories on or off before starting.

---

## 🔄 The Game Loop

1. **Lobby:** Players join via code and add their names. Host tweaks settings.
2. **Reveal Phase:** The screen shows a list of players. When you tap your name, your screen locks down. Privately view if you are a **Civilian** (and the secret word) or the **Impostor**.
3. **Discussion Phase:** A synced countdown timer starts. Players take turns saying one word related to the secret word.
4. **Voting Phase:** Once time is up, players independently select who they think the Impostor is. You can vote for multiple people if you suspect multiple Impostors.
5. **Results & Scoring:** The game tallies the votes, eliminates the highest voted players, and reveals the truth. 

### 🏆 Intelligent Scoring System
Points are calculated automatically at the end of each round:
* **All Impostors Caught:** Civilians earn **+2 points**.
* **Impostors Win (0 Caught):** Impostors successfully bluffed and earn **+3 points**.
* **Partial Catch:** If there were 2 Impostors and only 1 was caught: 
  * The escaping Impostor gets **+2 points**.
  * Any Civilian who successfully voted for a caught Impostor gets **+1 point**.

---

## 🛠️ Tech Stack 

* **Frontend:** React.js
* **Build Tool:** Vite 
* **Backend/Database:** Google Firebase Realtime Database
* **Styling:** Pure inline CSS-in-JS + injected dynamic keyframes (Zero external UI libraries).
* **Hosting:** Netlify (Continuous Deployment)

---

## 🚀 How to Run Locally

If you want to download the code and run this game on your own machine:

**1. Clone the repository:**
```bash
git clone [https://github.com/SB-Sachin/imposter-game.git](https://github.com/SB-Sachin/imposter-game.git)
cd imposter-game
2. Install Dependencies:

Bash
npm install
3. Firebase Setup:

Create a free project on the Firebase Console.

Set up a Realtime Database and set the read/write rules to true.

Create a file in the src folder named firebase.js.

Paste your Firebase config object into firebase.js:

JavaScript
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  // ... other config vars
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
4. Start the Development Server:

Bash
npm run dev
5. Build for Production:

Bash
npm run build
(This generates the dist folder which can be dropped directly into Netlify).
