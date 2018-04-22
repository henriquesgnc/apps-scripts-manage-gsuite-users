# Manage G Suite Users with Google Apps Scripts

The purpose of this project is to show how simple is the management of G Suite users through google forms.

- Features
    - Creates accounts on G Suite.
    - Suspends accounts in G Suite.
    - Inserts the new user/employee in serveral Google groups.
    - Allows the creation of an event for the manager or HR team remembering the date of admission.
    - Send an automatic email to the employee's personal email with the admission data.

### How to Use Google Scripts

Visit the [Google Scripts - Admin SDK](https://developers.google.com/admin-sdk/directory/v1/quickstart/apps-script) site and complete the steps described in the rest of this page. and in about five minutes you'll have a simple Google Apps Script that makes requests to the Directory API.

### Using the Manage Scripts
 
 - Create a simple [Google Forms](https://docs.google.com/forms) with the basic informations of the user.
 - Open the spreadsheet responses.
 - Go to Tools > Script Editor.
 - Paste the addUser.js in the [Google Scripts](https://script.google.com). Create another file and paste the suspendUser.js.
 - Go to Edit > All your triggers and insert the addUser function and suspendUser function to run on form submit.


