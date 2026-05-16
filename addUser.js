/**
 * Triggered on Google Form submit when "Create login" is selected.
 *
 * 1. Creates a G Suite user account via Admin SDK Directory API
 * 2. Adds the user to configured Google Groups
 * 3. Sends a welcome email to the employee's personal address
 * 4. Creates a calendar event on the employee's start date (optional)
 */

function addUser() {
  var ss = SpreadsheetApp.openById('spreadsheetId');
  var sheet = ss.getSheets()[0];
  var lastRow = ss.getLastRow();

  var choice = sheet.getRange('B' + lastRow).getValue();
  var date = sheet.getRange('C' + lastRow).getValue();
  var email = sheet.getRange('D' + lastRow).getValue();
  var firstName = sheet.getRange('E' + lastRow).getValue();
  var lastName = sheet.getRange('F' + lastRow).getValue();
  var department = sheet.getRange('G' + lastRow).getValue();
  var managerEmail = sheet.getRange('H' + lastRow).getValue();
  var groups = sheet.getRange('I' + lastRow).getValue();
  var personalEmail = sheet.getRange('J' + lastRow).getValue();

  if (choice !== 'Create login') {
    return;
  }

  var user = {
    primaryEmail: email,
    name: {
      givenName: firstName,
      familyName: lastName
    },
    changePasswordAtNextLogin: true,
    organizations: [{
      department: department
    }],
    password: generatePassword()
  };

  AdminDirectory.Users.insert(user);

  if (groups) {
    addUserToGroups(email, groups);
  }

  if (managerEmail && date) {
    createCalendarEvent(managerEmail, date);
  }

  if (personalEmail) {
    sendWelcomeEmail(firstName, personalEmail, date);
  }
}

/**
 * Adds a user to one or more Google Groups.
 * @param {string} userEmail - The user's email address
 * @param {string} groupEmails - Comma-separated list of group email addresses
 */
function addUserToGroups(userEmail, groupEmails) {
  var groups = groupEmails.split(',');
  groups.forEach(function (group) {
    var trimmedGroup = group.trim();
    if (trimmedGroup) {
      AdminDirectory.Members.insert({
        email: userEmail.trim(),
        role: 'MEMBER'
      }, trimmedGroup);
    }
  });
}

/**
 * Sends a welcome email to the employee's personal email address.
 * @param {string} firstName - Employee's first name
 * @param {string} personalEmail - Employee's personal email address
 * @param {Date} startDate - Employee's start date
 */
function sendWelcomeEmail(firstName, personalEmail, startDate) {
  var formattedDate = Utilities.formatDate(startDate, 'UTC', 'dd/MM/yyyy');
  var subject = 'Welcome to our company';
  var body = 'Dear ' + firstName + ',\n\n' +
    'Documents and information required for employee admission.\n' +
    'Your start date is: ' + formattedDate + '\n\n' +
    'Welcome aboard!';

  MailApp.sendEmail(personalEmail, subject, body, {
    name: 'HR Team',
    replyTo: 'hr@example.com',
    from: 'hr@example.com'
  });
}

/**
 * Creates a calendar event on the employee's start date.
 * @param {string} managerEmail - Manager's email (calendar owner)
 * @param {Date} startDate - Employee's start date
 */
function createCalendarEvent(managerEmail, startDate) {
  var event = {
    summary: 'New employee starts today!',
    location: 'Our Company',
    description: '',
    start: {
      dateTime: getRelativeDate(9, startDate).toISOString()
    },
    end: {
      dateTime: getRelativeDate(10, startDate).toISOString()
    },
    reminders: {
      useDefault: false,
      overrides: [{
        method: 'email',
        minutes: 1
      }]
    }
  };

  Calendar.Events.insert(event, managerEmail);
}

/**
 * Returns a Date object set to a specific hour on the given date.
 * @param {number} hour - Hour of the day (0-23)
 * @param {Date} date - The reference date
 * @returns {Date}
 */
function getRelativeDate(hour, date) {
  var result = new Date(date.getTime());
  result.setHours(hour);
  result.setMinutes(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
}

/**
 * Generates a random temporary password.
 * @returns {string}
 */
function generatePassword() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
