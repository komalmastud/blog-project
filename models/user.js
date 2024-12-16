const { createHmac, randomBytes } = require("crypto");
const { Schema, model } = require("mongoose");

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
  const salt = "someRandamSalt"; // Use 'hex' encoding
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  // Save salt and hashed password
  user.salt = salt;
  user.password = hashedPassword;

  next();
});
userSchema.static("matchPassword", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not Found");
  console.log(user);
  const salt = randomBytes(16).toString();
  const hashedPassword = user.password;
  const userProvidedHash = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");
  if (hashedPassword !== userProvidedHash)
    throw new Error("Incorrect password");
  return user;
});
// Create the model
const User = model("user", userSchema);

// Export the model
module.exports = User;
