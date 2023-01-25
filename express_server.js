const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = {
    urls: urlDatabase,
    username,
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const username = req.cookies['username'];
  const templateVars = {username};
  res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const username = req.cookies['username'];
  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL],
    username,
  };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const value = req.body.longURL;
  const key = generateRandomString();
  urlDatabase[key] = value;
  res.redirect(`/urls/${key}`);
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const deleteKey = req.params.id;
  delete urlDatabase[deleteKey];
  res.redirect("/urls");
});
app.post("/urls/:id", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const key = req.params.id;
  urlDatabase[key] = req.body.longUrl;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  console.log(req.body);
  res.clearCookie("username");
  res.redirect("/urls");
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