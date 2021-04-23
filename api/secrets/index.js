const JWT_SECRET = process.env.JWT_SECRET || 'supersecret!';    // secret phrase 
const BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || 8;   
module.exports = {
    JWT_SECRET,
    BCRYPT_ROUNDS
}