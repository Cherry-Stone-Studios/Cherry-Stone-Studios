const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config;
const log = console.log;
const { requireUser } = require("./utils.cjs");
// const { UNSAFE_NavigationContext } = require("react-router-dom");
// const { useReducer } = require("react");

const {
  createUser,
  getAllUsers,
  getUserById,
  userUpdatesUser,
  deleteUser,
  getUserByUsername,
} = require("../db/users.cjs");

const { useReducer } = require("react");
// USING JWT TO SIGN USER WITH TOKEN THAT LASTS 2 WEEKS
const signToken = async ({ id, username }) => {
  const user = { id, username };
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "2w",
  });

  return token;
};

// CREATE/POST
// POST /api/users/register
router.post("/register", async (req, res) => {
  // given username and password on body
  const { name, username, email, password, date_of_birth } = req.body;
  try {
    // register user with createUser function
    singleUser = await createUser({
      name,
      username,
      email,
      password,
      date_of_birth,
    });
    // sign token with user info
    const token = await signToken({
      id: singleUser.id,
      username: singleUser.username,
    });
    // Send back the token w/ message
    res.send({
      message: `Thank you for registering, wonderful to meet you ${singleUser.name}.`,
      token,
    });
  } catch (err) {
    throw err;
  }
});

// login to existing account with JWT
// POST api/users/login
router.post("/login", async (req, res) => {
  // We recieve a username and password on body
  const plainPassword = req.body.password;
  // has plainPassword for compare
  const { username } = req.body;
  //Does this user exist?
  try {
    const user = await getUserByUsername(username);

    // if the user is not in our DB -> throw err that states "user does not exist"
    if (!user) {
      res.send({
        message: `User does not exist. Register today to keep track of the fun!`,
      });
      // else if the user is in the DB
    } else {
      // check password agaist the hash with bcrypt compare
      const validPassword = await bcrypt.compare(plainPassword, user.password);
      // if the password is not a match
      if (!validPassword) {
        // return a invalid credentials message to user
        res.send({
          message:
            "Sorry, you have provided invalid credendials for successful login. Try again.",
        });
        // if the password is a match
      } else {
        // this is a valid login --> sign token
        const token = await signToken({ id: user.id, username: user.username });
        res.send({
          message: `${user.username} Sucessfully Logged In!`,
          token,
          ...user,
        });
      }
    }
  } catch (err) {
    throw err;
  }
});

// READ/GET ALL USERS
// GET /api/users/
router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).send(users);
  } catch (err) {
    throw err;
  }
});

// GET USER BY id
// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id); //convert req.params.id to INT
    const singleUser = await getUserById(userId);
    res.status(200).send(singleUser);
  } catch (err) {
    log(err);
    res.sendStatus(500);
  }
});

// READ/GET ALL USERS BY USERNAME
// GET /api/users/username/:username
router.get("/username/:username", async (req, res) => {
  const username = req.params.username;
  try {
    user = await getUserByUsername(username);
    res.send(user);
  } catch (err) {
    throw err;
  }
});

//UPDATE USER BY ID
// PUT /api/users/:id
router.put("/:id", requireUser, async (req, res, next) => {
  // grab the id from params -> this is the user we want to update
  const id = parseInt(req.params.id);
  const { name, username, email, password } = req.body;

  // grab the id from body -> this is the user who is interacting with our app
  const currId = req.user.id;

  // check to see if the two usernames are a match
  const matchedId = id === currId;

  // if they are not a match, send them a non-authorized error (401)
  if (!matchedId) {
    res.sendStatus(401);
    //else if they are, run the updateUsers function
  } else {
    // update the user with given username from req.params
    try {
      const singleUser = await userUpdatesUser({
        id,
        name,
        username,
        email,
        password,
      });
      res.send({ message: `User updated successfully!`, ...singleUser });
    } catch (err) {
      throw err;
    }
  }
});

//DELETE USER
// DELETE /api/users/:id
router.delete("/:id", requireUser, async (req, res) => {
  // grab the id from params -> this is the user we want to delete
  const id = parseInt(req.params.id);

  // grab the id from body -> this is the user who is interacting with our app
  const currId = req.user.id;

  // check to see if the two usernames are a match
  const matchedId = id === currId;

  // if they are not a match, send back an unauthorized message
  if (!matchedId) {
    res.status(401);
    // if they are a match, run deleteUser with the ID of current user
  } else
    try {
      const deletedUser = await deleteUser(id);
      res
        .send({
          message: `You have successfully deleted your account. An alley can be a dangerous place for a stay, stay safe!`,
        })
        .status(200);
    } catch (err) {
      throw err;
    }
});

module.exports = router;
