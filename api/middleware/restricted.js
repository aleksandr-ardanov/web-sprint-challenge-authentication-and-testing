const Users = require('../auth/users-model')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../secrets/index')

const restrict = (req, res, next) => {
  const token = req.headers.authorization
  if(!token){
    res.status(401).json({message:"token required"})
  } else{
    jwt.verify(token,JWT_SECRET,(err,decoded) => {
      if (err){
        res.status(401).json({message:"Token invalid"})
      } else{
        req.decodedToken = decoded;
        next()
      }
    })
    }
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
};

const checkUsernameIsTaken = async (req,res,next) => {
  const {username, password} = req.body;
  if (username && password){
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

const checkUsernameExists = async (req,res,next) =>{
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