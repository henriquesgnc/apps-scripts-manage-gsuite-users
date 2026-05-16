# Apps Scripts — Manage G Suite Users

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Google Apps Script](https://img.shields.io/badge/apps%20script-Google%20Workspace-4285F4?logo=google)](https://developers.google.com/apps-script)
[![Directory API](https://img.shields.io/badge/api-Admin%20SDK%20Directory-34A853?logo=google)](https://developers.google.com/admin-sdk/directory)

Google Apps Scripts to automate **G Suite (Google Workspace) user lifecycle management** via Google Forms. Onboarding, offboarding, group membership, email notifications, and calendar reminders — all triggered by a single form submission.

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
| **User Creation** | Creates G Suite accounts via Admin SDK Directory API |
| **User Suspension** | Suspends accounts on offboarding — not deleted, re-enable anytime |
| **Group Membership** | Adds users to multiple Google Groups automatically |
| **Email Notification** | Sends welcome email to employee's personal address |
| **Calendar Reminder** | Creates an event for managers on employee start date |
| **Form-Driven** | Triggered by Google Forms submission — no manual API calls |
| **Temporary Password** | Auto-generates password; user must change on first login |

## Repository Structure

```
apps-scripts-manage-gsuite-users/
├── addUser.js             # Onboarding: create user, add to groups, notify, calendar event
├── suspendUser.js         # Offboarding: suspend user account
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## Quick Start

### Prerequisites

- A **Google Workspace** account with admin privileges
- [Admin SDK Directory API](https://developers.google.com/admin-sdk/directory/v1/quickstart/apps-script) enabled in your Google Cloud project

### 1. Create the Google Form

Create a [Google Form](https://docs.google.com/forms) with the following fields (order matters):

| Column | Field | Type | Example |
|--------|-------|------|---------|
| A | Timestamp | Auto | — |
| B | Choice | Multiple choice | `Create login`, `Revoke Access` |
| C | Start Date | Date | `01/01/2025` |
| D | Company Email | Short answer | `john.doe@company.com` |
| E | First Name | Short answer | `John` |
| F | Last Name | Short answer | `Doe` |
| G | Department | Short answer | `Engineering` |
| H | Manager Email | Short answer | `manager@company.com` |
| I | Groups | Short answer | `all@company.com,eng@company.com` |
| J | Personal Email | Short answer | `john.doe@gmail.com` |

### 2. Set up Apps Script

1. Open the linked **Google Sheets** responses spreadsheet
2. Go to **Extensions > Apps Script**
3. Create two script files:
   - Paste the contents of [`addUser.js`](addUser.js)
   - Paste the contents of [`suspendUser.js`](suspendUser.js)
4. Replace `'spreadsheetId'` with your spreadsheet's ID (from the URL: `https://docs.google.com/spreadsheets/d/<ID>/edit`)
5. Replace `hr@example.com` in `sendWelcomeEmail` with your company's HR email

### 3. Configure triggers

1. In the Apps Script editor, go to **Triggers** (clock icon) > **Add Trigger**
2. Set up two triggers:

| Function | Event Source | Event Type |
|----------|-------------|------------|
| `addUser` | From spreadsheet | On form submit |
| `suspendUser` | From spreadsheet | On form submit |

### 4. Authorize

Run `addUser` manually once (with a test row) to trigger the OAuth consent screen. Authorize the following scopes:

- `https://www.googleapis.com/auth/admin.directory.user`
- `https://www.googleapis.com/auth/groups`
- `https://www.googleapis.com/auth/script.send_mail`
- `https://www.googleapis.com/auth/calendar.events`
- `https://www.googleapis.com/auth/spreadsheets`

### 5. Done

Submit a form entry with **"Create login"** selected. The script will:
1. Create the user in G Suite
2. Add them to the specified Google Groups
3. Send a welcome email to their personal address
4. Create a calendar event on the start date

## Usage

### Onboarding

Fill the form with `Create login` as the choice. The `addUser` trigger runs automatically.

### Offboarding

Fill the form with `Revoke Access` as the choice. The `suspendUser` trigger runs automatically.

> The user is **suspended**, not deleted. Their data (email, Drive files, etc.) is preserved. To re-enable a user, update them via the Admin Console or API.

## Customization

### Email Template

Edit the `sendWelcomeEmail` function in [`addUser.js`](addUser.js):

```js
var subject = 'Welcome to our company';
var body = 'Dear ' + firstName + ',\n\n...';
```

### Calendar Event

Edit the `createCalendarEvent` function to change the event title, location, reminders, or time:

```js
var event = {
  summary: 'New employee starts today!',
  start: { dateTime: getRelativeDate(9, startDate).toISOString() },
  // ...
};
```

### Spreadsheet Columns

If your form has different columns, update the column letters in both scripts (e.g., `'B' + lastRow`, `'D' + lastRow`, etc.).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on setup, code style, and pull requests.

## References

- [Admin SDK Directory API Quickstart](https://developers.google.com/admin-sdk/directory/v1/quickstart/apps-script)
- [AdminDirectory Class Reference](https://developers.google.com/apps-script/reference/admin-directory)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [SpreadsheetApp Class](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app)
- [MailApp Class](https://developers.google.com/apps-script/reference/mail/mail-app)
- [CalendarApp Class](https://developers.google.com/apps-script/reference/calendar/calendar-app)

## License

MIT — See [LICENSE](LICENSE) for details.
