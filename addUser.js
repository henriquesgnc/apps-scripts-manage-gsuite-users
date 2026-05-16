/**
 * Onboarding handler. Called by onFormSubmit when Choice === 'Create login'.
 *
 * Steps (each wrapped in try/catch):
 * 1. Insert user via Admin SDK Directory API
 * 2. Add user to Google Groups (if groups provided)
 * 3. Send welcome email to personal address (if email provided)
 * 4. Create calendar event for manager (if manager + date provided)
 *
 * @param {Object} values  — e.namedValues from the form submission
 * @param {Sheet}  sheet   — the responses sheet
 * @param {number} row     — the submitted row number
 * @param {Object} config  — configuration from getConfig()
 */

function addUser(values, sheet, row, config) {
  var email = getFormValue(values, 'Company Email');
  var firstName = getFormValue(values, 'First Name');
  var lastName = getFormValue(values, 'Last Name');
  var department = getFormValue(values, 'Department');
  var managerEmail = getFormValue(values, 'Manager Email');
  var groups = getFormValue(values, 'Groups');
  var personalEmail = getFormValue(values, 'Personal Email');
  var startDateStr = getFormValue(values, 'Start Date');

  if (!email) {
    throw new Error('Company Email is required');
  }

  var errors = [];

  // Step 1: Create user (critical)
  try {
    AdminDirectory.Users.insert({
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
    });
    Logger.log('User created: ' + email);
  } catch (e) {
    throw new Error('Failed to create user: ' + e.toString());
  }

  // Step 2: Add to groups (non-critical)
  if (groups) {
    var groupList = groups.split(',');
    groupList.forEach(function (group) {
      var trimmed = group.trim();
      if (!trimmed) return;
      try {
        AdminDirectory.Members.insert({
          email: email,
          role: 'MEMBER'
        }, trimmed);
        Logger.log('Added ' + email + ' to group ' + trimmed);
      } catch (e) {
        var msg = 'Failed to add to group ' + trimmed + ': ' + e.toString();
        Logger.log(msg);
        errors.push(msg);
      }
    });
  }

  // Step 3: Welcome email (non-critical)
  if (personalEmail) {
    try {
      var formattedDate = startDateStr;
      var body = 'Dear ' + firstName + ',\n\n' +
        'Documents and information required for employee admission.\n' +
        'Your start date is: ' + formattedDate + '\n\n' +
        'Welcome aboard!';

      MailApp.sendEmail(personalEmail, 'Welcome to ' + config.companyName, body, {
        name: 'HR Team',
        replyTo: config.hrEmail
      });
      Logger.log('Welcome email sent to: ' + personalEmail);
    } catch (e) {
      var msg = 'Failed to send welcome email: ' + e.toString();
      Logger.log(msg);
      errors.push(msg);
    }
  }

  // Step 4: Calendar event (non-critical)
  if (managerEmail && startDateStr) {
    try {
      var startDate = new Date(startDateStr);
      var event = {
        summary: 'New employee starts today!',
        location: config.companyName,
        description: firstName + ' ' + lastName + ' starts today.',
        start: { dateTime: relativeDate(9, startDate).toISOString() },
        end: { dateTime: relativeDate(10, startDate).toISOString() },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'email', minutes: 1 }]
        }
      };
      Calendar.Events.insert(event, managerEmail);
      Logger.log('Calendar event created for: ' + managerEmail);
    } catch (e) {
      var msg = 'Failed to create calendar event: ' + e.toString();
      Logger.log(msg);
      errors.push(msg);
    }
  }

  if (errors.length > 0) {
    setStatus(sheet, row, 'PARTIAL - ' + errors.join(' | '), config);
  }
}

/**
 * Returns a Date set to a specific hour on the given date.
 */
function relativeDate(hour, date) {
  var d = new Date(date.getTime());
  d.setHours(hour);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}
