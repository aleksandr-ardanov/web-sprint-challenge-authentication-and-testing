const Users = require('../auth/users-model')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../secrets/index')

const restrict = (req, res, next) => {
  const token = req.headers.authorization           //check if token exists
  if(!token){
    res.status(401).json({message:"token required"})
  } else{
    jwt.verify(token,JWT_SECRET,(err,decoded) => {    //check if token is valid
      if (err){
        res.status(401).json({message:"Token invalid"})
      } else{
        req.decodedToken = decoded;  //don't need to use in this project but it's useful to add more restrictions
        next()      //token valid, go to the next step
      }
    })
    }
};

const checkUsernameIsTaken = async (req,res,next) => {    //check if username already in database for registration
  const {username, password} = req.body;    
  if (username && password){                  //check if username and password entered
    const [check] = await Users.findBy({username})
    if (!check){
       next()
    } else{
      res.status(401).json({message:"username taken"})
    }
  } else{
    res.status(401).json({message:"username and password required"})
  }
}

const checkUsernameExists = async (req,res,next) =>{ ///check if username  in database for login 
  const {username,password} = req.body;
  if (username && password){
    const [user] = await Users.findBy({username})
    if (!user){
      res.status(401).json({message:"invalid credentials"})
    } else {
      req.user = user 
      next()
    }
  } else {
    res.status(401).json({message:"username and password required"})
  }
}




module.exports = {
  restrict,
  checkUsernameExists,
  checkUsernameIsTaken
}