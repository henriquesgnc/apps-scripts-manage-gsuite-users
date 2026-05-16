# Contributing

Thanks for your interest in contributing to this project. Here's how to get started.

## Setup

1. Fork the repository
2. Clone your fork
3. Open the scripts in [Google Apps Script](https://script.google.com) for testing

## Making Changes

1. Create a branch from the default branch
2. Make your changes
3. Test the scripts in Google Apps Script with a test spreadsheet
4. Update documentation if your change affects user-facing behavior
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
feat(addUser): add custom email template support
fix(suspendUser): correct revoke access logic
docs(readme): add form field reference table
```

## Pull Request Guidelines

- Keep PRs focused on a single change
- Reference any issues your PR addresses
- Update the README if usage instructions change
- Verify scripts work end-to-end with Google Forms + Sheets before submitting

## Code Style

- Use 2-space indentation
- Use `var` (Google Apps Script V8 compatibility)
- Add JSDoc comments for all functions
- Keep functions small and single-purpose
- Use `camelCase` for variable and function names

## Testing

Before submitting a PR:

1. Create a test Google Form with the required fields
2. Copy the script into the linked spreadsheet's Apps Script editor
3. Enable the Admin SDK Directory API
4. Run `addUser` and `suspendUser` manually first, then via form submit trigger
5. Verify user creation, group membership, email delivery, and calendar events

## Questions?

Open a [discussion](https://github.com/henriquesgnc/apps-scripts-manage-gsuite-users/discussions) or an issue.
