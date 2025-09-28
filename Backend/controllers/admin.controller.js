import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admin } from "../models/admin.model.js";
//import { sendSMS } from "../services/sendSMS.service.js";

const generateAccessAndRefreshTokens = async function (adminId) {
  try {
    const admin = await Admin.findById(adminId);
    const accessToken = await admin.generateAccessToken();
    const refreshToken = await admin.generateRefreshToken();
    admin.refreshToken = refreshToken;
    admin.accessToken = accessToken;
    await admin.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating the tokens");
  }
};

const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, phoneNumber, examPreference } = req.body;
  if (!fullName || !email || !password || !phoneNumber || !examPreference) {
    return res.status(400).json(new ApiError(400, "All Fields are required"));
  }

  const existingAdmin = await Admin.findOne({
    email,
  });

  if (existingAdmin) {
    return res.status(401).json(new ApiError(401, "Admin Already exists"));
  }

  const admin = await Admin.create({
    fullName,
    email,
    password,
    phoneNumber,
    examPreference,
  });

  const createdAdmin = await Admin.findById(admin._id).select(
    "-refreshToken -phoneNumber"
  );

  if (!createdAdmin) {
    return res.status(402).json(new ApiError(402, "Something Went Wrong"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    admin._id
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
      new ApiResponse(200, "Admin registered Successfully", {
        admin: createdAdmin,
        accessToken,
        refreshToken,
      })
    );
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json(new ApiError(400, "All Fields are required"));
  }

  const admin = await Admin.findOne({
    email,
  }).select("-refreshToken -phoneNumber");

  if (!admin) {
    return res.status(404).json(new ApiError(404, "Admin Not Found"));
  }

  const isPasswordCorrect = await admin.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    return res.status(401).json(new ApiError(401, "Invalid Password"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    admin._id
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
      new ApiResponse(200, "Admin Logged In successfully", {
        admin: admin,
        accessToken,
        refreshToken,
      })
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res
      .status(401)
      .json(new ApiResponse(401, "Admin not authenticated", {}));
  }

  await Admin.findByIdAndUpdate(req.body._id, {
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
    .json(new ApiResponse(200, "Admin logged out successfully", {}));
});

export { registerAdmin, loginAdmin, logoutAdmin };
