# Google Workspace User Management Apps Script

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Google Apps Script](https://img.shields.io/badge/apps%20script-Google%20Workspace-4285F4?logo=google)](https://developers.google.com/apps-script)
[![Directory API](https://img.shields.io/badge/api-Admin%20SDK%20Directory-34A853?logo=google)](https://developers.google.com/admin-sdk/directory)

A lightweight **Google Apps Script automation for Google Workspace user lifecycle management**.

This project helps HR, IT, and Workspace administrators create and suspend users from Google Forms submissions, automatically add users to Google Groups, send welcome emails, and create manager calendar reminders — using Google Sheets, Apps Script, and the Admin SDK Directory API.

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ Google Forms │────▶│ Google Sheets     │────▶│ Apps Script Trigger │
│ (HR fills)   │     │ (responses)       │     │ (onFormSubmit)      │
└──────────────┘     └──────────────────┘     └──────────┬──────────┘
                                                          │
                                     ┌────────────────────┼────────────────────┐
                                     │                    │                    │
                                     ▼                    ▼                    ▼
                              ┌──────────┐        ┌──────────┐         ┌──────────┐
                              │ Admin SDK│        │  Gmail   │         │ Calendar │
                              │ Directory│        │ (notify) │         │ (event)  │
                              └──────────┘        └──────────┘         └──────────┘
```

## Key Features

| Feature | Description |
|---------|-------------|
| **User Creation** | Creates Google Workspace accounts via Admin SDK Directory API |
| **User Suspension** | Suspends accounts on offboarding — not deleted, re-enable anytime |
| **Group Membership** | Adds users to multiple Google Groups automatically |
| **Email Notification** | Sends welcome email to employee's personal address |
| **Calendar Reminder** | Creates an event for managers on employee start date |
| **Single Trigger** | One `onFormSubmit` dispatcher routes `Create login` / `Revoke Access` |
| **Script Properties** | No hardcoded IDs — configure via Project Properties |
| **Error Handling** | `try/catch` per operation, status column, admin notifications |
| **Idempotent** | Uses `e.namedValues` from the form event (no race condition on `lastRow`) |

## Repository Structure

```
google-workspace-user-management-apps-script/
├── onFormSubmit.js        # Entry point: dispatcher, config, password, error helpers
├── addUser.js             # Onboarding: create user, add to groups, notify, calendar
├── suspendUser.js         # Offboarding: suspend user account
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## Quick Start

### Prerequisites

- A **Google Workspace** account with admin privileges
- [Admin SDK Directory API](https://developers.google.com/admin-sdk/directory/v1/quickstart/apps-script) enabled

### 1. Create the Google Form

Create a [Google Form](https://docs.google.com/forms) with these fields (exact names matter — they become keys in `e.namedValues`):

| Field Name | Type | Example |
|-----------|------|---------|
| `Choice` | Multiple choice | `Create login`, `Revoke Access` |
| `Start Date` | Date | `01/01/2025` |
| `Company Email` | Short answer | `john.doe@company.com` |
| `First Name` | Short answer | `John` |
| `Last Name` | Short answer | `Doe` |
| `Department` | Short answer | `Engineering` |
| `Manager Email` | Short answer | `manager@company.com` |
| `Groups` | Short answer | `all@company.com,eng@company.com` |
| `Personal Email` | Short answer | `john.doe@gmail.com` |

### 2. Configure Script Properties

1. Open the linked **Google Sheets** responses spreadsheet
2. Go to **Extensions > Apps Script**
3. Create three script files and paste:
   - [`onFormSubmit.js`](onFormSubmit.js) (entry point + helpers)
   - [`addUser.js`](addUser.js) (onboarding logic)
   - [`suspendUser.js`](suspendUser.js) (offboarding logic)
4. Go to **File > Project Properties > Script Properties** and add:

| Property | Value |
|----------|-------|
| `HR_EMAIL` | `hr@yourcompany.com` |
| `COMPANY_NAME` | `Your Company` |
| `ADMIN_EMAIL` | `admin@yourcompany.com` (optional, for error alerts) |
| `STATUS_COLUMN` | `K` (optional, defaults to K) |

### 3. Configure the trigger

Go to **Triggers** (clock icon) > **Add Trigger**:

| Function | Event Source | Event Type |
|----------|-------------|------------|
| `onFormSubmit` | From spreadsheet | On form submit |

> Only **one trigger** is needed. The dispatcher reads the `Choice` field and routes accordingly.

### 4. Authorize

Run `onFormSubmit` once manually to trigger the OAuth consent screen. Authorize:

- `https://www.googleapis.com/auth/admin.directory.user`
- `https://www.googleapis.com/auth/groups`
- `https://www.googleapis.com/auth/script.send_mail`
- `https://www.googleapis.com/auth/calendar.events`
- `https://www.googleapis.com/auth/spreadsheets`

### 5. Done

Submit a form with **"Create login"**. The script:
1. Creates the user in Google Workspace
2. Adds them to the specified Google Groups
3. Sends a welcome email to their personal address
4. Creates a calendar event on the start date
5. Writes `SUCCESS - User created` in the status column

## Usage

### Onboarding

Fill the form with `Create login`. The `onFormSubmit` trigger calls `addUser` automatically.

### Offboarding

Fill the form with `Revoke Access`. The `onFormSubmit` trigger calls `suspendUser`.

> The user is **suspended**, not deleted. Data (email, Drive files) is preserved.

## Offboarding scope

This script currently **suspends** the user account. It does **not**:

- Transfer Drive files to another user
- Revoke OAuth tokens or application-specific passwords
- Remove the user from Google Groups
- Delegate mailbox access
- Set up auto-reply
- Reset the user's password

For a full offboarding checklist, extend `suspendUser.js` with the operations your organization requires.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| User creation fails | Throws immediately, status = `FAILED`, admin notified |
| Group addition fails | Logged, non-blocking, status = `PARTIAL` with details |
| Welcome email fails | Logged, non-blocking, status = `PARTIAL` with details |
| Calendar event fails | Logged, non-blocking, status = `PARTIAL` with details |
| Missing required fields | Throws with descriptive message |

Failed submissions are logged via `Logger.log()`. If `ADMIN_EMAIL` is configured, the admin receives an email with the error and submitted values.

## Customization

### Email Template

Edit the `body` in `addUser.js`:

```js
var body = 'Dear ' + firstName + ',\n\n...';
```

### Calendar Event

Edit the `event` object in `addUser.js`:

```js
var event = {
  summary: 'New employee starts today!',
  start: { dateTime: relativeDate(9, startDate).toISOString() },
  // ...
};
```

### Status Column

Change the `STATUS_COLUMN` Script Property (default: `K`). The column is computed dynamically — no need to edit code.

## Roadmap

- [x] Replace hardcoded spreadsheet ID with Script Properties
- [x] Replace fixed column letters with `e.namedValues`
- [x] Single `onFormSubmit` dispatcher
- [x] Execution status column in Google Sheets
- [x] Error handling and admin notifications
- [x] Improved temporary password generation (`Utilities.getUuid()`)
- [ ] Group removal on offboarding
- [ ] Session / OAuth token revocation examples
- [ ] Drive transfer guidance
- [ ] `.clasp` support for local development (`clasp push` / `clasp deploy`)
- [ ] Screenshots of Google Form and Apps Script setup

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on setup, code style, and pull requests.

## References

- [Admin SDK Directory API Quickstart](https://developers.google.com/admin-sdk/directory/v1/quickstart/apps-script)
- [Apps Script Documentation](https://developers.google.com/apps-script)
- [PropertiesService](https://developers.google.com/apps-script/reference/properties)
- [AdminDirectory Class](https://developers.google.com/apps-script/reference/admin-directory)
- [SpreadsheetApp Class](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app)
- [MailApp Class](https://developers.google.com/apps-script/reference/mail/mail-app)
- [CalendarApp Class](https://developers.google.com/apps-script/reference/calendar/calendar-app)

## License

MIT — See [LICENSE](LICENSE) for details.
