# GRE Brain Lag 🧠💥

**GRE vocab for ADHD brains.** Flashcards, sound-based mnemonics, quizzes, and a comic story for every word group — built around the GregMAT vocab groups.

> For ADHD students surviving the GRE, made by Linh's distracted brain.

## Features

- **Flashcards** for 1,107 words in 37 groups: pronunciation (with audio), definition, Vietnamese meaning, example sentence, illustration, and a mnemonic.
- **Part of speech everywhere**, e.g. *temper (v, n)*, with the GRE meaning first.
- **Sound-hook mnemonics** in one pattern: *SOUND HOOK → image → meaning* (e.g. *LACK-onic: he lacks words, so he says very little*).
- **Comics**: each group is a short story starring Mai, Bảo, Bà, Kevin, and Mochi the cat. Every word in the group shows up in context, in real speech bubbles, thought clouds, and caption boxes drawn inside the panels. Tap a bold word to open its card.
- **Daily quiz with a review rotation**: today's new group + yesterday's group + a cycling review group.
- **Full review (All 90)**: every word from the day's three groups once. Missed words come back a few questions later and stay boosted for the rest of the day.
- **Missed today**: a list (and flashcard deck) of today's misses. Get each right twice to clear it.
- **Same-meaning drills** for Sentence Equivalence: *Match pairs* and *Pick 2 of 6*.
- **Sync between phone and laptop** with Google sign-in (optional, free), or move progress with a backup file.
- Light and dark mode, works on phone and laptop. No build step, no frameworks.

## Run it locally

Open `index.html` in a browser. That's it.

(If your browser blocks something when opening the file directly, run a tiny local server instead:)

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publish with GitHub Pages

1. Create a new repository on GitHub (e.g. `gre-brain-lag`) and push this folder to it with GitHub Desktop or `git` (the `images/` folder is skipped automatically).
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the `main` branch and the `/ (root)` folder, then **Save**.
4. After a minute or two, the site is live at `https://<your-username>.github.io/gre-brain-lag/`.

## Project structure

```
index.html            Page shell: header, tabs, empty views
css/style.css         All styles (colors, layout, cards, comics, quiz)
js/art.js             Comic art kit (characters, props, backgrounds),
                      word illustrations, and the speech-bubble engine
js/data/words.js      The 37 vocab groups (SETS)
js/data/clusters.js   Same-meaning families for the synonym drills
js/data/comics.js     One comic story per group (COMICS)
js/sync-config.js     Your Firebase settings for cross-device sync (optional)
js/app.js             App logic: flashcards, groups, drills, quiz, comics, sync
images/               Flashcard pictures + images.js map (local only, not in git)
```

Scripts are plain `<script>` files loaded in order, so `art.js` and the data files must load before `app.js`.

## Editing content

**A word** lives in `js/data/words.js` as an array:

```
[word, pronunciation, definition, synonym, example, mnemonic, emoji, sound effect, Vietnamese, part of speech]
```

The text before the first `:` in a mnemonic is shown in bold.

**A comic panel** lives in `js/data/comics.js`:

```js
{ bg: "kitchen",
  cast: "ba:26:angry:point,kevin:74:nervous:shrug:L",
  props: "bowl:50:228", fx: "",
  cap: "Bà tastes the chè. Then comes a long, *caustic* *diatribe*.",
  bub: [["ba", "Ketchup?! Even Mochi won't eat this!"],
        ["mai", "So *puerile*.", "think"]] }
```

- `cast`: `who:x(0–100):expression:pose[:L to face left][:held prop]`
  - who: `mai`, `bao`, `ba`, `kevin`, `mochi`, `npc0`–`npc4`
  - expressions: happy, sad, angry, shock, smug, cry, sleep, love, nervous, think, neutral
  - poses: stand, wave, point, cheer, hold, think, shrug, hips, run
- `bg`: room, kitchen, street, cafe, classroom, park, night, stage, beach, office, market, temple, plain, sky, library
- Wrap vocab words in `*asterisks*` to make them bold, tappable, and tagged with their part of speech. Each speaker in `bub` must be in `cast`.
- Bubbles are placed automatically. Keep captions under ~100 characters and bubbles under ~75.

## Saving progress

Progress (quiz stats, history, today's misses, settings) is always saved in the browser on each device. To share it between your phone and laptop, use one of these (both are in the **Quiz** tab under **Sync & backup**):

- **Sign in with Google** (automatic sync, needs the one-time setup below).
- **Download backup / Load backup** (no setup). Download the file on one device, send it to the other (AirDrop, Zalo, email), and load it there. Loading *merges* with what's already on that device instead of overwriting it.

When both devices have progress, they're merged: for each word, the record with more answers wins; quiz histories are combined; settings come from whichever device was used last. The site re-syncs every time you come back to the tab.

## Sync progress between devices (one-time setup, ~10 minutes, free)

Sync uses [Firebase](https://firebase.google.com/) on the free Spark plan (no credit card).

1. Go to the [Firebase console](https://console.firebase.google.com/), click **Create a project**, and name it (e.g. `gre-brain-lag`). Google Analytics isn't needed.
2. **Turn on Google sign-in:** *Build → Authentication → Get started → Sign-in method → Google → Enable*, pick your support email, **Save**.
3. **Allow your website:** *Authentication → Settings → Authorized domains → Add domain* → `YOUR-USERNAME.github.io`.
4. **Create the database:** *Build → Firestore Database → Create database*. Pick a nearby location (e.g. `asia-southeast1`, Singapore) and **production mode**.
5. **Lock it down:** in Firestore, open the **Rules** tab, replace everything with this, then **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /progress/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

   This means each signed-in person can only read and write their own progress.
6. **Connect the site:** *Project settings (gear icon) → General → Your apps →* the web icon `</>`. Register an app (skip Firebase Hosting), then copy the `firebaseConfig` values into `js/sync-config.js`:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "gre-brain-lag.firebaseapp.com",
     projectId: "gre-brain-lag",
     appId: "1:1234567890:web:abc123"
   };
   ```

   These values are meant to be public; the rules from step 5 are what protect the data.
7. Commit and push. On your laptop *and* your phone, open the site → **Quiz** → **Sign in with Google** with the same account. Done.

Firebase's menu names change now and then; if a label looks different, look for the closest match.

## Flashcard images

The flashcard pictures came from Quizlet sets. Quizlet's terms don't allow re-publishing its content, and set images often belong to Quizlet's image partners or other users, so they are **kept out of the GitHub repo** (`images/` is in `.gitignore`).

- **On your computer**, keep the `images/` folder inside the project. Opening `index.html` locally shows the pictures.
- **On the live site**, `images/` isn't uploaded, so cards automatically show the emoji scenes and custom drawings instead.
- To use your own pictures online, put them in `images/`, list them in `images/images.js`, and remove `images/` from `.gitignore`.

## Credits

- Word groups follow the GregMAT vocabulary list.
- Flashcard pictures (local copy only, not published) came from Quizlet sets and belong to their owners. GregMAT owns its word list and materials; this is an unofficial personal study tool and is not affiliated with GregMAT or ETS. GRE® is a registered trademark of ETS.
- Mnemonics, example sentences, comics, and code by Linh (with help from Claude).
- Fonts: [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) and [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) via Google Fonts (SIL Open Font License).

## License

The code is released under the [MIT License](LICENSE). Third-party materials (see Credits) keep their own rights.
