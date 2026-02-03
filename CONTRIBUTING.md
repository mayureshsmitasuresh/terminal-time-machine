# Contributing to Terminal Time Machine

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to `terminal-time-machine`. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## 🛠️ specific Development Setup

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
    ```bash
    npm link
    # Now you can run `ttm` anywhere to test your changes
    ```

## 🧪 Testing

We use a simple test suite to verify core logic.
```bash
# Run tests
npm test
```
Please ensure all tests pass before submitting a PR. If you add a new feature, please add a test case in `tests/`.

## 📝 Coding Standards

- **Runtime**: Node.js v18+ (ES Modules).
- **Style**: Use clean, modern JavaScript (Async/Await, const/let).
- **Imports**: Always include file extensions in imports (e.g., `import { foo } from './bar.js'`).
- **Dependencies**: Keep dependencies minimal. We use `simple-git`, `commander`, and `inquirer` as core libraries.

## 💾 Commit Convention

We follow **[Conventional Commits](https://www.conventionalcommits.org/)**. This is crucial because `ttm` itself uses these conventions to generate stories and release notes!

**Format**: `<type>(<scope>): <subject>`

**Allowed Types**:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Example**:
```bash
feat(visualization): add support for neon theme
fix(parser): resolve crash on empty repositories
docs(readme): update installation instructions
```

## 🚀 Pull Request Process

1.  Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2.  Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3.  Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
4.  You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## 🤝 Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. Be respectful, kind, and constructive.
