const express = require("express");
const app = express();
const port = 1003;
app.use(express.json());
let users = [];
let reqcount = 0;
//gnerating token function
function generateToken(length = 16) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

app.post("/signup", function (req, res) {
  const username = req.body.username.replace(/\s+/g, "");
  const password = req.body.password.replace(/\s+/g, "");
  // so we have just created some values that the user will fill

  //lets have one check that the username should be unique
  if (users.find((u) => u.username === username)) {
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
  const username = req.body.username.replace(/\s+/g, "");
  const password = req.body.password.replace(/\s+/g, "");

  //lets have a check whether the username and password is correct or not

  const reaUser = users.find(
    (u) => u.username == username && u.password == password
  );
  reaUser.reqcount = reqcount;
  if (reaUser.reqcount) {
    res.json({
      msg: "your data has been registered already",
      reaUser,
    });
    return;
  }

  if (reaUser) {
    reqcount++;
    const token = generateToken();
    reaUser.token = token;
    res.json({
      msg: "the token has been generated for the user",
      reaUser,
      token,
    });
    return;
  } else {
    res.json({
      msg: "the username or password might be incorrect",
    });
  }
});

app.listen(port, () => {
  console.log(`the app is listening at port ${port}`);
});
