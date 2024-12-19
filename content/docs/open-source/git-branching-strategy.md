---
title: Git Branching Strategy
category: open-source
description: This document outlines my Git branching strategy, which is designed to maintain a clean and organized codebase, facilitate collaboration, and streamline my development process.
order: 1
icon: fas fa-code-branch
---

## Main Branches

### `main` (or `master`)
- The primary branch that represents the production-ready state of the project.
- All code in this branch should be stable and deployable.
- Direct commits to this branch are not allowed; changes are only merged through pull requests.

### `develop`
- The integration branch for features.
- This branch contains the latest delivered development changes for the next release.
- Feature branches are created from and merged back into this branch.

## Supporting Branches

### Feature Branches
- Named `feature/[feature-name]` or `feature/[issue-number]-[brief-description]`
- Created from: `develop`
- Merged back into: `develop`
- Used for developing new features or enhancements.
- Should be short-lived and focused on a specific feature or task.

### Release Branches
- Named `release/[version-number]`
- Created from: `develop`
- Merged back into: `develop` and `main`
- Used for preparing a new production release.
- Allow for minor bug fixes and preparing meta-data for a release (version number, build dates, etc.).

### Hotfix Branches
- Named `hotfix/[issue-number]-[brief-description]`
- Created from: `main`
- Merged back into: `main` and `develop`
- Used to quickly patch production releases.

## Workflow

1. Create a feature branch from `develop`.
2. Work on the feature, committing changes regularly.
3. When the feature is complete, create a pull request to merge into `develop`.
4. After code review and approval, merge the feature branch into `develop`.
5. When ready for a release, create a release branch from `develop`.
6. Perform final testing and bug fixes in the release branch.
7. Merge the release branch into both `main` and `develop`.
8. Tag the release in `main`.

For hotfixes:
1. Create a hotfix branch from `main`.
2. Fix the issue and commit the changes.
3. Create a pull request to merge into both `main` and `develop`.
4. After approval, merge and tag the new version in `main`.

## Best Practices

- Keep branches short-lived and focused.
- Regularly pull changes from the parent branch to stay up-to-date.
- Write clear, concise commit messages following my [commit message conventions](commit-message-conventions).
- Use pull requests for code review before merging into main branches.
- Delete feature branches after merging.

By following this branching strategy, I aim to maintain a clean and organized repository, facilitate collaboration, and ensure the stability of my production code.