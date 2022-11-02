const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];////(bearer, "pw")totally up to you approad, query or header
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    //const decodedToken = jwt.verify(token, "secret_this_should_be_longer");//token- argument we parsed from incoming request, secret string we used from signing in
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: "You are not Authenticated!" });//not authenticated
  }
};

//to check wether authenticated or not
//check if we have  a token and  is valid
//middleware- function which receives req, res, next (same as multer)
//verify - gives us the decoded token
