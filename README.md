# Jackson's Europe Travels

A personal travel tracking site. Static HTML/CSS/JS, deployed to Vercel.

## Project structure

```
/
├── index.html          ← public site
├── style.css
├── main.js             ← map + calendar logic
├── data/
│   ├── travels.json    ← map pins (visited + planned)
│   └── events.json     ← calendar events
│
├── admin.html          ← PRIVATE — .gitignored, never deployed
├── admin.js
├── admin.css
└── .gitignore
```

## How to update content

Because the admin files are gitignored, Vercel never sees them — the public site is read-only.

**Workflow to add/edit content:**

1. Open `admin.html` locally in your browser (just double-click or use a local server like `npx serve .`)
2. Add or remove places / events using the forms
3. Click **Download travels.json** or **Download events.json**
4. Move the downloaded file into the `data/` folder, replacing the old one
5. `git add data/ && git commit -m "update travels" && git push`
6. Vercel auto-deploys — done ✓

## Finding coordinates

For `lat`/`lng` of a city, right-click any spot on [Google Maps](https://maps.google.com) and the coordinates appear at the top of the context menu.

## Tech used

- [Leaflet.js](https://leafletjs.com/) for the interactive map
- [CartoDB dark tiles](https://carto.com/basemaps/) for map tiles
- [Google Fonts](https://fonts.google.com/) — Playfair Display, Courier Prime, Jost
- Vanilla HTML / CSS / JS — no build step required