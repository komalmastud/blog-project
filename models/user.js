const { createHmac, randomBytes } = require("crypto");
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

// Define the user schema
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/images.png", // Default profile image
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

// Pre-save hook to hash password
userSchema.pre("save", function (next) {
  const user = this;

  // Only hash the password if it has been modified or is new
  if (!user.isModified("password")) return next();

  // Generate salt and hash the password
  const salt = randomBytes(16).toString("hex"); // Generate random salt
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  // Save salt and hashed password
  user.salt = salt;
  user.password = hashedPassword;

  next();
});

// Static method to match the password and generate token
userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not Found");

    // Compare the provided password with the hashed password in the database
    const hashedPassword = createHmac("sha256", user.salt)
      .update(password) // Use the password provided by the user
      .digest("hex");

    if (hashedPassword !== user.password) {
      throw new Error("Incorrect password");
    }

    // Generate token for the user
    const token = createTokenForUser(user);
    return token;
  }
);

// Create the model
const User = model("user", userSchema);

// Export the model
module.exports = User;
