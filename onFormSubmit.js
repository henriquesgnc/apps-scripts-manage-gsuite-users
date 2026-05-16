/**
 * Single entry point triggered on Google Form submit.
 * Reads the 'Choice' field and routes to addUser or suspendUser.
 *
 * Trigger configuration:
 *   Function: onFormSubmit   |   Event: On form submit
 *
 * Script Properties (File > Project Properties > Script Properties):
 *   SPREADSHEET_ID   — the Google Sheets ID (from the URL)
 *   HR_EMAIL         — HR email address (from/replyTo for welcome emails)
 *   COMPANY_NAME     — used in calendar event location
 *   ADMIN_EMAIL      — notified on critical failures
 *   STATUS_COLUMN    — column letter where status is written (default: K)
 */

function onFormSubmit(e) {
  var values = e.namedValues;
  var sheet = e.range.getSheet();
  var row = e.range.getRow();

  if (!values) {
    Logger.log('Error: no namedValues in event object');
    return;
  }

  var config = getConfig();
  var choice = getFormValue(values, 'Choice');

  try {
    if (choice === 'Create login') {
      addUser(values, sheet, row, config);
      setStatus(sheet, row, 'SUCCESS - User created', config);
    } else if (choice === 'Revoke Access') {
      suspendUser(values, sheet, row, config);
      setStatus(sheet, row, 'SUCCESS - User suspended', config);
    } else {
      setStatus(sheet, row, 'SKIPPED - Unknown choice: ' + choice, config);
    }
  } catch (error) {
    var message = 'FAILED - ' + error.toString();
    Logger.log('onFormSubmit error: ' + message);
    setStatus(sheet, row, message, config);
    notifyAdmin(config, error.toString(), values);
  }
}

function getConfig() {
  var props = PropertiesService.getScriptProperties();

  return {
    hrEmail: props.getProperty('HR_EMAIL') || 'hr@example.com',
    companyName: props.getProperty('COMPANY_NAME') || 'Our Company',
    adminEmail: props.getProperty('ADMIN_EMAIL') || '',
    statusColumn: props.getProperty('STATUS_COLUMN') || 'K'
  };
}

function getFormValue(namedValues, fieldName) {
  var entry = namedValues[fieldName];
  return entry && entry.length > 0 ? entry[0].trim() : '';
}

function setStatus(sheet, row, message, config) {
  try {
    var col = columnLetterToNumber(config.statusColumn);
    sheet.getRange(row, col).setValue(message);
  } catch (e) {
    Logger.log('Failed to write status: ' + e.toString());
  }
}

function notifyAdmin(config, errorMessage, values) {
  if (!config.adminEmail) {
    Logger.log('No admin email configured — skipping notification');
    return;
  }

  var details = 'Form submission failed with error:\n\n' +
    errorMessage + '\n\n' +
    'Submitted values:\n' +
    JSON.stringify(values, null, 2);

  try {
    MailApp.sendEmail(config.adminEmail, 'User management script error', details);
  } catch (e) {
    Logger.log('Failed to notify admin: ' + e.toString());
  }
}

function generatePassword() {
  return Utilities.getUuid().slice(0, 10) + 'Aa1!';
}

function columnLetterToNumber(letter) {
  var col = 0;
  for (var i = 0; i < letter.length; i++) {
    col = col * 26 + (letter.toUpperCase().charCodeAt(i) - 64);
  }
  return col;
}
