const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.listen(PORT, () => {
  // console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies['userID'];
  const templateVars = {
    urls: urlDatabase,
    userID: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies['userID'];

  if (!userID) {
    res.redirect("/login");
  }

  const templateVars = {userID};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.cookies['userID'];
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
    res.status(400).send("Shortened url does not exist");
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render('registration');
});

app.get("/login", (req, res) => {
  const templateVars = {userID: 'test'};
  res.render('login', templateVars);
});


//Database
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
  test: {
    id: "test",
    email: "test@test.com",
    password: "test",
  },
};
//Posts
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("You need to enter an email and password");
  }
  for (const singleUser in users) {
    const user = users[singleUser];
    if (user.email === email) {
      return res.status(400).send("Email already in use");
    }
  }
  const id = Math.random().toString(36).substring(2, 6);
  const newID = {
    id,
    email,
    password
  };
  users[id] = newID;
  res.cookie('userID', newID.id);
  // console.log(users[id]);

  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  const value = req.body.longURL;
  const key = generateRandomString();
  urlDatabase[key] = value;
  
  const userID = req.cookies['userID'];
  
  if (!userID) {
    return res.status(400).send("Need to be logged in to create new urls");
  }
  res.redirect(`/urls/${key}`);
});

app.post("/urls/:id/delete", (req, res) => {
  // console.log(req.body);
  const deleteKey = req.params.id;
  delete urlDatabase[deleteKey];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  // console.log(req.body);
  const key = req.params.id;
  urlDatabase[key] = req.body.longUrl;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  // console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("You need to enter an email and password");
  }
  
  for (const singleUser in users) {
    const user = users[singleUser];
    
    if (user.email === email && password === user.password) {
      res.cookie("userID", user.id);
      res.redirect("/urls");
    }
  }
  return res.status(403).send("Email cannot be found or password is incorrect");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/login");
});

const generateRandomString = function() {
  let result = "";
  const len = 6;
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = len; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};