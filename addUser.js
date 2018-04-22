// Inserts user in G Suite
function addUser(){
  var ss = SpreadsheetApp.openById('spreadsheetId');
  var sheet = ss.getSheets()[0];
  var lastRow = ss.getLastRow();
  var choice = ss.getRange('B'+lastRow).getValue();
  var email =  ss.getRange('E'+lastRow).getValue();
  var firstname = ss.getRange('F'+lastRow).getValue();
  var lastname = ss.getRange('G'+lastRow).getValue();
  var personalMail = ss.getRange('N'+lastRow).getValue();
  var departament = ss.getRange('I'+lastRow).getValue();
  var date = Utilities.formatDate(sheet.getRange("C"+lastRow).getValue(), "UTC", "dd/MM/yyyy" );ss.getRange('Q'+lastRow).getValue();
  var feedbackDate = sheet.getRange("C"+lastRow).getValue();

  if (choice != 'Create login') {
    return false;
  }
  {
  var user = {
    primaryEmail: email,
    name: {
      givenName : firstname,
      familyName: lastname,
    },
    changePasswordAtNextLogin: true,
    departament: departament,
    password: Math.random().toString(36)
  };

  user = AdminDirectory.Users.insert(user);
}

// Inserts the user in Google Groups
function ensureEmailOnGroup(email,groupEmail){
  var group = groupEmail.trim();
  var email = email.trim();
  var member = {
    'email': email,
    'role': 'MEMBER'
  }
  email:group
  member = AdminDirectory.Members.insert(member, groupEmail.trim());
}

function addGroupMember(UserEmail,groupEmail){
  var groupTrim = groupEmail.trim();
  var groupsToInsert = groupEmail.split(',');
  groupsToInsert.forEach(function(groupEmail) {
    ensureEmailOnGroup(UserEmail,groupEmail);
  });
};

// Sends the first contact on employee personal mail
function notifyMember(site,personalMail,firstname,lastname,date){
  var body = "Documents and information required for employee admission.";
  var subject = "Welcome to our company";
  var options = {name:"HR Team",htmlBody:body,replyTo:"hr@example.com",from:"hr@example.com"};
    MailApp.sendEmail(personalMail,subject,body,options);
  };

// Creates an event in manager's calendar
function createEvent (managerMail,feedbackDate) {
  var calendarId = managerMail;
  var date = new Date(feedbackDate.getTime());
  var start = getRelativeDate(9);
  var end = getRelativeDate(10);
  var event = {
    summary: 'New employee starts today!',
    location: 'Our Company',
    description: "" ,
    start: {
      dateTime: start.toISOString()
    },
    end: {
      dateTime: end.toISOString()
      },
    };
    reminders:{
      useDefault: false
    overrides: [
    {
    method: 'email',
      minutes: 1
    }
    ]
  };
  event = Calendar.Events.insert(event, calendarId);
  };

function getRelativeDate(hour,daysOffset,feedbackDate) {
  var date = new Date(feedbackDate.getTime());
  date.setDate(date.getDate());
  date.setHours(hour);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
  };
}
