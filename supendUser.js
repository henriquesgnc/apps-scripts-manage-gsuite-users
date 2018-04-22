function suspendUser(ss,sheet,lastRow,choice,userKey,firstname,lastname) {
  if (choice == 'Revoke Access') {
   return false;
  }
 { var user = {
  primaryEmail: userKey,
  name: {
    givenName : firstname,
    familyName: lastname,
  },
  suspended: true,
};
  user = AdminDirectory.Users.update(user,userKey);
}
