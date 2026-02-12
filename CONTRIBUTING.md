# Contributing to Terminal Time Machine

First off, thanks for taking the time to contribute! 🎉

We love the Open Source community. **Terminal Time Machine** is built by developers like you, for developers like you. Whether you're fixing a typo, adding a new theme, or implementing a complex algorithm for deeper Git analysis, your help is appreciated.

## 👋 Welcome!

The following is a set of guidelines for contributing to `terminal-time-machine`. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## 📂 Project Structure

Understanding where things live will help you get started faster:

## 🏗️ Project Architecture

TTM follows a strictly modular "Pipeline" architecture:

1.  **Commands** (`src/commands/`): The entry points. They handle user input, call analyzers, and then pass data to generators.
2.  **Analyzers** (`src/analyzers/`): Pure logic functions that extract data from Git or the filesystem. They return raw data objects.
    *   *Example*: `git-parser.js`, `commit-analyzer.js`, `shell-history-parser.js`.
3.  **Generators** (`src/generators/`): Visual components that take raw data and turn it into strings (Markdown, Terminal Output, Graphs).
    *   *Example*: `heatmap-generator.js`, `timeline-generator.js`, `story-generator.js`.
4.  **Utils** (`src/utils/`): Shared helpers for formatting, export, and interactivity.

### Data Flow
`User Input` -> `Command` -> `Analyzer` (Get Data) -> `Generator` (Make Visuals) -> `Output`

---

## 🚀 Adding a New Command

Want to add a new feature? Follow this pattern:

1.  **Create the Command**: Add `src/commands/my-feature.js`.
2.  **Implement Logic**:
    ```javascript
    import { parseGitHistory } from '../analyzers/git-parser.js';
    
    export const myFeatureCommand = async (options) => {
      const data = await parseGitHistory(process.cwd());
      console.log('My Feature:', data.totalCommits);
    };
    ```
3.  **Register It**: Import and add to `program` in `src/index.js`.
4.  **Add to Menu**: Add an entry to the `choices` array in `interactiveMode()` in `src/index.js`.

---

## 🧪 Testing

We value quality. Before submitting a PR:

1.  **Run Manual Tests**:
    ```bash
    node bin/ttm.js stats
    node bin/ttm.js timeline
    node bin/ttm.js simulator
    node bin/ttm.js upgrades
    node bin/ttm.js contributors
    ```
2.  **Verify Exports**: Try exporting to PDF to ensure the layout holds up.
3.  **Check Edge Cases**: Run on an empty repo or a very large repo.

---

## 📝 Documentation

- Update `docs.md` if you add user-facing features.
- Update `README.md` if you change installation steps.

## 🛠️ Development Setup

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/terminal-time-machine.git
    cd terminal-time-machine
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Link for local testing**:
    This is the magic step. It allows you to run `ttm` anywhere on your machine using your *local* code.
    ```bash
    npm link
    # Now you can run `ttm story` or `ttm stats` immediately to test changes!
    ```

## 🧪 Testing

We use a simple test suite to verify core logic. Please run tests before submitting a PR.
```bash
npm test
```
If you add a new feature, please add a corresponding test case in `tests/`.

## 📝 Coding Standards

- **Runtime**: Node.js v18+ (ES Modules).
- **Style**: clean, modern JavaScript. We love `async/await`.
- **Commits**: Please follow [Conventional Commits](https://www.conventionalcommits.org/). This helps us auto-generate our own changelogs!
    - `feat`: A new feature
    - `fix`: A bug fix
    - `docs`: Documentation only
    - `style`: Formatting, missing semi colons, etc
    - `refactor`: A code change that neither fixes a bug nor adds a feature

## 🚀 Pull Request Process

1.  Create a feature branch from `main`.
2.  Make your changes.
3.  Run `npm test` to ensure nothing broke.
4.  Push your branch and open a Pull Request.
5.  Wait for a review! We try to review PRs quickly.

## 🤝 Code of Conduct

Please be respectful and kind. We are here to learn and build together.
