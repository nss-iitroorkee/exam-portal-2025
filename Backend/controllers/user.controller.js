import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
//import { sendSMS } from "../services/sendSMS.service.js";

const generateAccessAndRefreshTokens = async function (userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating the tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, phoneNumber, examType } = req.body;
  if (!fullName || !email || !password || !phoneNumber || !examType) {
    return res.status(400).json(new ApiError(400, "All Fields are required"));
  }

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    return res.status(401).json(new ApiError(401, "User Already exists"));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phoneNumber,
    examType,
  });

  const createdUser = await User.findById(user._id).select(
    "-refreshToken -phoneNumber"
  );

  if (!createdUser) {
    return res.status(402).json(new ApiError(402, "Something Went Wrong"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User registered Successfully", {
        user: user,
        accessToken,
        refreshToken,
      })
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json(new ApiError(400, "All Fields are required"));
  }

  const user = await User.findOne({
    email,
  }).select("-refreshToken -phoneNumber");

  if (!user) {
    return res.status(404).json(new ApiError(404, "User Not Found"));
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    return res.status(402).json(new ApiError(402, "Invalid Password"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User Logged In successfully", {
        user: user,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res
      .status(401)
      .json(new ApiResponse(401, "User not authenticated", {}));
  }

  await User.findByIdAndUpdate(req.body._id, {
    $unset: { refreshToken: 1 },
    isVerified: false,
  });

  // Clear cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully", {}));
});

export { registerUser, loginUser, logoutUser };
