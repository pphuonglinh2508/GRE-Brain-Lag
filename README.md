# GRE Brain Lag 🧠💥

**GRE vocab for ADHD brains.** Flashcards, sound-based mnemonics, quizzes, and a comic story for every word group — built around the GregMAT vocab groups.

> For ADHD students surviving the GRE, made by Linh's distracted brain.

## Features

- **Flashcards** for 1,107 words in 37 groups: pronunciation (with audio), definition, Vietnamese meaning, example sentence, a mnemonic, and an emoji scene (or a custom drawing for some words).
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

1. Create a new repository on GitHub (e.g. `gre-brain-lag`) and push this folder to it with GitHub Desktop or `git`. The `images/` folder is skipped automatically.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the `main` branch and the `/ (root)` folder, then **Save**.
4. After a minute or two, the site is live at `https://<your-username>.github.io/gre-brain-lag/`.

## Project structure

```
gre-brain-lag/
├── index.html            Page shell: header, tabs, empty views
├── css/
│   └── style.css         All styles (colors, layout, cards, comics, quiz)
├── js/
│   ├── app.js            App logic: flashcards, groups, drills, quiz, comics, sync
│   ├── art.js            Comic art kit (characters, props, backgrounds),
│   │                     custom word drawings, and the speech-bubble engine
│   ├── sync-config.js    Your Firebase settings for cross-device sync (optional)
│   └── data/
│       ├── words.js      The 37 vocab groups (SETS)
│       ├── clusters.js   Same-meaning families for the synonym drills
│       └── comics.js     One comic story per group (COMICS)
├── images/               Optional: your own flashcard pictures (local only, not in git)
├── README.md             This file
├── LICENSE               MIT License
├── .gitignore            Keeps images/ and system files out of git
├── .gitattributes        Line-ending settings for git
└── .nojekyll             Tells GitHub Pages to serve the files as they are
```

Scripts are plain `<script>` files loaded in order, so `art.js` and the data files must load before `app.js`.

## Editing content

**A word** lives in `js/data/words.js` as an array:

```
[word, pronunciation, definition, synonym, example, mnemonic, emoji, sound effect, Vietnamese, part of speech]
```

The text before the first `:` in a mnemonic is shown in bold. The `emoji` and `sound effect` fields make the card's emoji scene.

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

## Use your own pictures

Every card comes with an emoji scene. If you'd rather study with pictures of your own, you can add them. They stay on your computer and are never uploaded.

1. Make a folder called `images` next to `index.html` and put your pictures in it. Any of .jpg, .png, .webp, .gif or .svg works, with any file names you like.
2. In that folder, create a file called `images.js`.
3. In `images.js`, add one line per word, using `"group:word"` and the picture's path:

```js
   const IMG = {
     "1:abound": "images/g01-abound.jpg",
     "3:arduous": "images/climbing.png"
   };
```

   The group number and word must match the card exactly (the group is shown on every flashcard). If a word appears in two groups, list it twice, once per group.
4. Open `index.html` from the project folder (not from inside a zip). Cards with a picture now show it; the rest keep their emoji scene, and so does any picture that fails to load.

**Keep it private.** The whole `images/` folder is listed in `.gitignore`, so GitHub Desktop and `git` won't upload your pictures. That also means your pictures only show when you open the site from your own computer, not on the public website.

**Where to get pictures:** use photos or drawings you made yourself, or images with a license that allows reuse (for example [Unsplash](https://unsplash.com), [Pixabay](https://pixabay.com) or [Openverse](https://openverse.org); check each image's license). Don't download pictures from flashcard or study sites: their terms usually don't allow it, and the images often belong to someone else.

## Credits

**Word list**
- Vocabulary groups by [GregMAT](https://www.gregmat.com).
- Groups 1–37 from the Quizlet set [GregMAT Vocabulary Groups/Sets 1–37](https://quizlet.com/1094578331/gregmat-vocabulary-groupssets-1-37-flash-cards/) by **@ahtn**.
- Additional credit to:
  - **@Blackdeathanton** for Groups 1–28
  - **@inch_rvndr** for Groups 29–32
  - **@pawanw2** for Groups 33–37

**This project**
- Mnemonics, example sentences, comics, and code by Linh, with help from Claude.
- Fonts: [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) and [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque), via Google Fonts (SIL Open Font License).

This is an unofficial personal study tool. It is not affiliated with or endorsed by GregMAT, Quizlet, or ETS. GRE® is a registered trademark of ETS.

## License

The code is released under the [MIT License](LICENSE). Third-party materials (see Credits) keep their own rights.
