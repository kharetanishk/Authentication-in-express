const express = require("express");
const app = express();
const port = 1003;
app.use(express.json());
let users = [];
let reqcount = 0;
//gnerating token function
function generateToken(length = 22) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

app.post("/signup", function (req, res) {
  //e have to first create some values that the user will fill
  const username = req.body.username;
  const password = req.body.password;

  //after filling the values we have to check that the users hasnt skipped any of it
  if (username == null) {
    res.json({
      msg: "usersname cannot be empty",
    });
  } else if (password == null) {
    res.json({
      msg: "pass ord cannot be empty",
    });
  } else if (users.find((u) => u.username === username)) {
    res.json({
      msg: "the user already exists",
      users,
    });
    return;
  } else {
    users.push({
      username: username,
      password: password,
    });
  }
  res.json({
    msg: "you are signned up",
    users,
  });
});

//
app.post("/signin", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  //lets have a check whether the username and password is correct or not

  const realUser = users.find(
    (u) => u.username == username && u.password == password
  );
  if (realUser) {
    const token = generateToken();
    realUser.token = token;
    res.json({
      msg: "the token has been generated for the user",
      token,
      users,
    });
    return;
  } else {
    res.json({
      msg: "the username or password might be incorrect",
    });
  }
});

///getting the username info through tokens
app.get("/me", function (req, res) {
  const token = req.headers.token;
  console.log(token);
  console.log(users);
  const existingUser = users.find((u) => u.token == token);
  if (existingUser) {
    res.json({
      username: existingUser.username,
      password: existingUser.password,
    });
  } else {
    res.json({
      msg: "invalid authentication",
    });
  }
});

//app link
app.listen(port, () => {
  console.log(`the app is listening at port ${port}`);
});
