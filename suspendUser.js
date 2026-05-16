/**
 * Triggered on Google Form submit when "Revoke Access" is selected.
 *
 * Suspends (deactivates) a G Suite user account via Admin SDK Directory API.
 * The account is not deleted — it can be re-enabled later.
 */

function suspendUser() {
  var ss = SpreadsheetApp.openById('spreadsheetId');
  var sheet = ss.getSheets()[0];
  var lastRow = ss.getLastRow();

  var choice = sheet.getRange('B' + lastRow).getValue();
  var email = sheet.getRange('D' + lastRow).getValue();

  if (choice !== 'Revoke Access') {
    return;
  }

  if (!email) {
    return;
  }

  var user = {
    primaryEmail: email,
    suspended: true
  };

  AdminDirectory.Users.update(user, email);
}
