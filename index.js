const express = require("express");
require("dotenv").config(); //npm install dotenv(to store jwt secret)
const bcrypt = require("bcrypt"); //npm install bcrypt(to hash the passworf)
const jwt = require("jsonwebtoken");
const app = express();
const port = 1003;
const JWT_SECRET = process.env.JWT_SECRET; //By using process.env.JWT_SECRET,
// the value is stored outside your code, in a separate .env file
//  (or set in your hosting environment).
app.use(express.json());
let users = [];
let reqcount = 0;
function requestCountMiddleware(req, res, next) {
  reqcount = reqcount + 1;
  next();
}
app.use(requestCountMiddleware);
//gnerating token function
//as we have switched to jwt so we dont need this generrate token any more
// function generateToken(length = 22) {
//   const chars =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let token = "";
//   for (let i = 0; i < length; i++) {
//     token += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return token;
// }

app.post("/signup", async function (req, res) {
  //e have to first create some values that the user will fill
  const { username, password } = req.body; //intiating two body to be put
  //the password should contain the string + number
  function isValidPassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
    return regex.test(password);
  } //Regular Expressions (RegEx) are built into JavaScript
  //  (and many other languages).
  //  They’re not a separate library — they’re part of the core language itself.

  //username or password cannot be empty
  if (!username || !password) {
    return res.json({
      msg: "the username or password cannot be empty",
    });
  }
  //the username should be unique
  if (users.find((u) => u.username === username)) {
    return res.json({
      msg: "the user already exists",
    });
  }

  //the username should be string and minimum length should be more than 3
  if (typeof username !== "string" || username.length < 3) {
    return res.json({
      msg: "invalid username",
    });
  }

  // lets validate the password
  if (!isValidPassword(password)) {
    return res.json({
      msg: "the password should contain at least one letter, at least one digit,no symbols",
    });
  }

  //hashing the password
  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    username: username,
    password: hashedPassword,
  });

  res.json({
    msg: "signned up successfully",
    users,
    reqcount,
  });
});

//
app.post("/signin", async function (req, res) {
  const { username, password } = req.body;

  //lets have a check whether the username correct or not
  const realUser = users.find((u) => u.username === username);
  // console.log(realUser);

  if (!realUser) {
    return res.json({
      msg: "Invalid username or password",
    });
  }

  // Compare password with hashed version
  const isPasswordCorrect = await bcrypt.compare(password, realUser.password);
  //console.log(isPasswordCorrect)
  //checking the password is valid or not
  if (!isPasswordCorrect) {
    return res.json({ msg: "Invalid username or password" });
  }

  //token using jwt
  const token = jwt.sign(
    {
      username: realUser.username,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({
    msg: "signned in successfully",
    token,
  });
  //generate token is a practice we did before jwt
  // const token = generateToken();
  // realUser.token = token;
  // realUser.token = token;as jwt doesnt need to store in data
});

///getting the username info through tokens
app.get("/me", function (req, res) {
  const token = req.headers.token;
  //we are using try and catch because If the token is invalid or expired, it will crash my
  // server. And if i don’t catch that error with a try...catch,
  // your Express app will throw an unhandled exception —
  // and crash the server or hang the response.
  try {
    const decodedtoken = jwt.verify(token, JWT_SECRET);
    // console.log(decodedtoken)
    const username = decodedtoken.username;
    // console.log(username)
    const existingUser = users.find((u) => u.username === username);
    //finding the user with the token

    if (existingUser) {
      return res.json({
        username: existingUser.username,
        // password: existingUser.password,
        reqcount,
      });
    } else {
      return res.json({ msg: "Invalid authentication" });
    }
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }

  // const decodedtoken = jwt.verify(token, JWT_SECRET);
  // // console.log(decodedtoken);
  // const username = decodedtoken.username;
  // // console.log(username);
  // //the below code is the practice we did before jwt
  // // const token = req.headers.token;
  // // console.log(token);
  // // console.log(users);
  // // const existingUser = users.find((u) => u.token == token);
  // const existingUser = users.find((u) => u.username == username);
  // // console.log(existingUser);
  // if (existingUser) {
  //   res.json({
  //     username: existingUser.username,
  //     password: existingUser.password,
  //     reqcount,
  //   });
  // } else {
  //   res.json({
  //     msg: "invalid authentication",
  //   });
  // }
});

//app link
app.listen(port, () => {
  console.log(`the app is listening at port ${port}`);
});
