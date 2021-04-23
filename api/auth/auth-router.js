const router = require('express').Router();
const jwt = require('jsonwebtoken')   //import jsonwebtoken
const bcrypt = require('bcryptjs')  //import bcrypt
const Users = require('./users-model')  //import actions with db
const {JWT_SECRET, BCRYPT_ROUNDS} = require('../secrets/index')  // what should be hidden to have our app protected
const {checkUsernameExists, checkUsernameIsTaken} = require('../middleware/restricted') //middleware

router.post('/register', checkUsernameIsTaken, (req, res, next) => {
    const user = req.body;        
    const rounds = BCRYPT_ROUNDS;   // how many rounds of hashing we do
    const hash = bcrypt.hashSync(user.password,rounds) //transform password to hashed value
    user.password = hash; 
    Users.add(user) 
      .then(user => {
        res.status(201).json(user)
      })
      .catch(next)
});

router.post('/login', checkUsernameExists, (req, res) => {
  const user = req.user;
  const {password} = req.body;
  if(bcrypt.compareSync(password, user.password)){    //check entered password and hashed password from db
    const token = createToken(user)         //creates a new token for further needs
    res.status(200).json({
      message:`Welcome home ${user.username}`,
      token
    }) 
  } else{
    res.status(401).json({message:"invalid credentials"})
  }
});

router.get('/',(req,res,next) => {    //wrote for myself to check all users
  Users.getAll()
    .then(users => {
      res.status(200).json(users)
    })
    .catch(next)
})

function createToken(user){     //function for create token based on provided user
  const payload = {
    subject:user.id,
    username:user.username,
  }
  const options = {
    expiresIn: '1d'
  }
  return jwt.sign(payload,JWT_SECRET,options)
}

module.exports = router;