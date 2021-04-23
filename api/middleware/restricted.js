const Users = require('../auth/users-model')

const restrict = (req, res, next) => {
  next();
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
};

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
  checkUsernameExists
}