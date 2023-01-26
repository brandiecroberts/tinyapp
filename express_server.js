const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

//middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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
  const userID = req.cookies['userID'];
  console.log(userID);
  
  if (!userID) {
    return res.status(400).render('urls_index');
  }
/**
 * Filter URLs by user
 *
 * @param {string} userID
 * @param {object} urlDatabase
 * 
 * @return {object} URLs
 */
  const urlsForUser = function(userID, urlDatabase) {
    const urls = {};
    for (let url in urlDatabase) {
      if (userID === urlDatabase[url].userID) {
        urls[url] = urlDatabase[url];
      }
    }

    return urls;
  };

  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
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
  test: {
    id: "test",
    email: "test@test.com",
    password: "test",
  },
};

//POST
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

  res.cookie('userID', users[id]);
  console.log(users[id]);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  const userID = req.cookies['userID'];
  if (!userID) {
    return res.status(400).send("Need to be logged in to create new urls");
  }
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = {longURL, userID};
  
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  // console.log(req.body);
  const userID = req.cookies['userID'];
  if (!userID) {
    return res.status(400).send("Need to be logged in to delete urls");
  }
  const deleteKey = req.params.id;
  delete urlDatabase[deleteKey];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  // console.log(req.body);
  const userID = req.cookies['userID'];
  if (!userID) {
    return res.status(400).send("Need to be logged in to edit urls");
  }
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.longUrl;

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
      return;
    }
  }
  return res.status(403).send("Email cannot be found or password is incorrect");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/login");
});

const generateRandomString = function() {
  // const id = Math.random().toString(36).substring(2, 6);
  // console.log(generateRandomString[id]);
  let result = "";
  const len = 6;
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = len; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};