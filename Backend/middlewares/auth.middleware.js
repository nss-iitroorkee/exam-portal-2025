import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json(new ApiError(401, "Unauthorized Request"));
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_EXPIRY);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -accessToken"
    );

    if (!user) {
      return res.status(402).json(new ApiError(402, "Invalid Access Token"));
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

