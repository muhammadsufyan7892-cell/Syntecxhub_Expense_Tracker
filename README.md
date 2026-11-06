# Finora — React Expense Tracker

**Syntecxhub Web Development Internship — Week 1, Project 1**  
GitHub repository name: **`Syntecxhub_Expense_Tracker`**

A responsive React dashboard that lets users manage income and expenses, see monthly trends, filter transactions, view a category breakdown, export a CSV file, and save changes in the browser.

## 1. Requirements

- Install **Node.js** and **npm**. Recommended: Node.js 22 LTS or a current supported Node version.
- Install **WebStorm** (or VS Code).
- Internet access is needed for `npm install` when dependencies are not already installed.

Check Node.js:

```bash
node -v
npm -v
```

## 2. Start the project in WebStorm

1. Extract `Syntecxhub_Expense_Tracker.zip`.
2. WebStorm > **File > Open** > choose the `Syntecxhub_Expense_Tracker` folder.
3. Open the **Terminal** tab in WebStorm. Make sure the terminal is inside the folder that contains `package.json`.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local address shown in your terminal (normally `http://localhost:5173/`).

If `npm` is not recognized, install Node.js, restart WebStorm and try again.

## 3. What to try

1. Dashboard loads sample transactions from the **local mock API endpoint** `/mock-expenses.json`.
2. Click **Add transaction** and enter a title, amount, type, category, and date.
3. Try adding both income and expenses.
4. Try the **All time / This month / Last 30 days / Last 90 days** filters.
5. Search for a transaction and edit or delete it.
6. Open **Insights & reports** to view the cash-flow chart and category summary.
7. Refresh the page. Data persists via `localStorage`.
8. Click **Export CSV** to download the filtered transactions.
9. Click **Reset demo data** on the Transactions page if you want to start with sample data again. **Warning:** This overwrites user-entered transactions.

## 4. How the code meets the Week 1 PDF

| Internship requirement | Implementation |
|---|---|
| Responsive expense tracker | `src/App.jsx` + responsive CSS in `src/App.css` |
| `useState` to manage form inputs and expenses | `App.jsx` state for `form`, `expenses`, filters, modal |
| `useEffect` to fetch and display data from a mock API | `fetch(`${import.meta.env.BASE_URL}mock-expenses.json`)` inside a `useEffect` in `App.jsx` |
| `useRef` for form field focus management | `titleRef` used on the transaction title input when modal opens |
| `useMemo` for performance | Memoized filtered transactions, totals, chart and category data |
| `useCallback` for performance | Memoized add, edit and delete-related event callbacks |

### Why is the API local?

The project fetches JSON via HTTP from a **local mock endpoint** served by Vite or the static hosting provider. It is a mock-data API alternative that needs no signup, paid plan, or API key. It is **not** a live backend or database. Data added through the UI is saved in each user's browser with `localStorage`. This is appropriate for a simple Week 1 React exercise. To build a real full-stack app later, replace it with a Node.js/Express API and a database.

## 5. Folder guide

```text
Syntecxhub_Expense_Tracker/
├── public/
│   ├── mock-expenses.json        ← mock data endpoint
│   └── _redirects                ← Netlify single-page app fallback
├── src/
│   ├── App.jsx                   ← UI components + React hooks + application logic
│   ├── App.css                   ← dashboard styles and responsive layout
│   ├── index.css                 ← global styles
│   └── main.jsx                  ← React entry point
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

## 6. Build before deployment

```bash
npm run build
```

Vite creates a **`dist`** folder containing production-ready files.

## 7. Upload to GitHub

1. Log in to GitHub > **New repository**.
2. Enter the name **`Syntecxhub_Expense_Tracker`**.
3. In WebStorm terminal, from the project root:

```bash
git init
git add .
git commit -m "Build responsive React expense tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Syntecxhub_Expense_Tracker.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub account name. If Git asks for credentials, sign in through its standard secure authentication. **Do not upload `.env`, passwords or API keys.** The `.gitignore` already excludes `node_modules` and `dist`.

Alternatively, create the repository and upload the project files through GitHub's website.

## 8. Free live demo (optional)

Deploy to **Netlify** by connecting your GitHub repo; choose build command `npm run build` and publish directory `dist`. Or, after building, manually deploy the generated `dist` folder using Netlify's drag-and-drop deploy feature. This is a static app, so no backend server is required for the demo endpoint.

## 9. Syntecxhub submission checklist

- [ ] Run app and manually test add / edit / delete / filters / refresh.
- [ ] Take clear screenshots of dashboard, form, and insights.
- [ ] Upload the **entire source code** to your GitHub repository named `Syntecxhub_Expense_Tracker`.
- [ ] Share your internship status on LinkedIn and mention **@Syntecxhub** (as stated in the PDF).
- [ ] Submit the GitHub link and any other required details via the official **Submission Form** before the deadline.

The PDF states that **at least one of the three projects** must be completed and submitted from this task; all weekly tasks must be completed to finish the internship.

## 10. Viva / explanation in simple words

- **React:** Builds a UI from reusable components.
- **useState:** Remembers transactions, filters and the form state.
- **useEffect:** Fetches sample data and saves changes to localStorage.
- **useRef:** Focuses the title field automatically when a form opens.
- **useMemo:** Avoids recalculating filters and summary values on every unrelated render.
- **useCallback:** Keeps event handler references stable when dependencies do not change.
- **Mock API:** The app loads demo JSON from `/mock-expenses.json` with `fetch`.
- **localStorage:** Persists changes in the same browser, but is not shared across devices or users.
- **Responsive CSS:** Makes the dashboard adapt to laptop and mobile screens.

> **Important:** This archive includes source code, not `node_modules`. Run `npm install` before `npm run dev`. The code was checked statically in the authoring environment, but npm dependencies could not be downloaded here because the package registry network was unavailable. Run `npm run build` on your own computer for final verification.
