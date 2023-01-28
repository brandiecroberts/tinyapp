const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const {getUserByEmail, generateRandomString, urlsForUser} = require('./helpers');

const app = express();
const PORT = 8080;

//Middleware
app.use(cookieSession(({
  name: 'session',
  keys: ['']
}))
);
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");


//URL Database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//Login/Logout Database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


//GET
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  
  if (!userID) {
    return res.status(400).render('urls_index');
  }

  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    userID: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;

  if (!userID) {
    res.redirect("/login");
  }

  const templateVars = {userID};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.userID;
 
  //Checking if user is logged in; if not they are not able to view URL
  if (!userID) {
    return res.status(400).render('urls_show', {error: "Need to be logged in"});
  } else if (userID !== urlDatabase[shortURL].userID) {
    return res.status(400).render('urls_show', {error: "You dont own this URL"});
  }
 
  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL],
    userID,
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    return res.status(400).send("Shortened url does not exist");
  }
  res.redirect(longURL.longURL);
});

app.get("/register", (req, res) => {
  res.render('registration');
});

app.get("/login", (req, res) => {
  const templateVars = {userID: 'test'};
  res.render('login', templateVars);
});


//POST
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //If there is no email or password entered; return an error message
  if (!email || !password) {
    return res.status(400).send("You need to enter an email and password");
  }
 
  //If the email is already registered; return an error message
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("Email already in use");
  }

  //Generates a random ID when registering a new account & hashes the password
  const id = Math.random().toString(36).substring(2, 6);
  const newID = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  users[id] = newID;
  
  //Keeps user logged in after succesfully registering
  res.cookie('userID', newID.id);
  req.session.userID = newID.id;

  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    return res.status(400).send("Need to be logged in to create new urls");
  }
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = {longURL, userID};
  
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.userID;

  //If userID does not match, user needs to log in to delete urls
  if (!userID) {
    return res.status(400).send("Need to be logged in to delete urls");
  }
  const deleteKey = req.params.id;
  delete urlDatabase[deleteKey];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  
  const userID = req.session.userID;
  if (!userID) {
    return res.status(400).send("Need to be logged in to edit urls");
  }
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.longUrl;

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //1. Checking for the Password and Email null values
  if (!email || !password) {
    return res.status(400).send("You need to enter an email and password");
  }
  //2. We are checking the email and password hashed within the DB and the email and password
  //supplied by the user
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("Email/password does not match, or you need to register new account");
  }
  if (bcrypt.compareSync(password, user.password)) {
    res.cookie("userID", user.id);
    req.session.userID = user.id;
    res.redirect("/urls");
    return;
  } else {
    return res.status(403).send("Email cannot be found or password is incorrect");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});