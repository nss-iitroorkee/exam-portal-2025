import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  examType: {
    type: String,
    required: true,
    enum: ["JEE", "NEET"],
  },
  role: {
    type: String,
    default: "user",
  },
  testsAttempted: [
    {
      testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
      answers: {
        type: Map,
        of: [String], 
      }, 
    },
  ],
  refreshToken: {
    type: String,
  },
});

/*
 * A salt is a random value added to the password before it is hashed to ensure
 * that even if two users have the same password, their hashed passwords will be different.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * Access Token: Short-lived, used for authentication of each request.
 * Refresh Token: Long-lived, used to refresh the access token once it expires.
 */

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
