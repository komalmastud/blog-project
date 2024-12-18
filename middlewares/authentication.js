const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName]; // Corrected from req.cookie

    if (!tokenCookieValue) {
      return next(); // Move to the next middleware if no token
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload; // Corrected from request.user
    } catch (error) {
      console.error("Error validating token:", error); // Optional: log error for debugging
      return next(); // Move to the next middleware even if validation fails
    }

    return next(); // Call next if everything works
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
