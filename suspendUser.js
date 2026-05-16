/**
 * Offboarding handler. Called by onFormSubmit when Choice === 'Revoke Access'.
 *
 * Suspends (deactivates) the user account via Admin SDK Directory API.
 * The account is not deleted — data is preserved and can be re-enabled.
 *
 * @param {Object} values  — e.namedValues from the form submission
 * @param {Sheet}  sheet   — the responses sheet
 * @param {number} row     — the submitted row number
 * @param {Object} config  — configuration from getConfig()
 */

function suspendUser(values, sheet, row, config) {
  var email = getFormValue(values, 'Company Email');

  if (!email) {
    throw new Error('Company Email is required for suspension');
  }

  try {
    AdminDirectory.Users.update({
      primaryEmail: email,
      suspended: true
    }, email);

    Logger.log('User suspended: ' + email);
  } catch (e) {
    throw new Error('Failed to suspend user ' + email + ': ' + e.toString());
  }
}
