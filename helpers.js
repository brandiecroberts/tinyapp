//function to allow user to be identified by their email
const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

//Generating random string
const generateRandomString = function() {
  let result = "";
  const len = 6;
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = len; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

//Filtering URLs by the specific user
const urlsForUser = function(userID, urlDatabase) {
  const urls = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      urls[url] = urlDatabase[url];
    }
  }

  return urls;
};


module.exports = {getUserByEmail, generateRandomString, urlsForUser};