import userModel from "../model/auth.model.js";
import sessionModel from "../model/session.model.js";
import { apiResponse, cookieResponse } from "../utils/api.utils.js";
import { generateTokens, verifyRefreshToken } from "../utils/auth.utils.js";
import crypto from "crypto";

export const googleAuth = async (req, res) => {
  const email = req.user.emails[0].value;

  let user = await userModel.findOne({ email });
  const isAlreadyExists = Boolean(user);

  if (!user) {
    user = await userModel.create({
      displayName: req.user.displayName,
      email,
      googleId: req.user.id,
    });
  }

  // Revoke all previous sessions for this user
  await sessionModel.updateMany(
    { userId: user._id, isRevoked: false },
    { $set: { isRevoked: true } },
  );

  const session = await sessionModel.create({
    userId: user._id,
    refreshTokenHash: "pending",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const refreshToken = generateTokens(user._id, "refresh", session._id);
  const accessToken = generateTokens(user._id, "access", session._id);

  session.refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await session.save();

  user.refreshToken = refreshToken;
  await user.save();
  cookieResponse(res, refreshToken);
  return apiResponse(
    res,
    200,
    isAlreadyExists ? "Login Successfully" : "Register Successfully",
    {
      user: {
        displayName: user.displayName,
        email: user.email,
        id: user._id,
      },
      accessToken,
    },
  );
};

export const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return apiResponse(res, 401, "Refresh token is required");
  }

  try {
    const decode = verifyRefreshToken(token);

    const user = await userModel.findById(decode.id);
    const session = await sessionModel.findOne({
      _id: decode.sessionId,
      userId: decode.id,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!user || !session) {
      return apiResponse(
        res,
        401,
        "Unauthorized: Refresh token is invalid, expired, or session has been revoked",
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    if (session.refreshTokenHash !== tokenHash) {
      session.isRevoked = true;
      await session.save();

      return apiResponse(res, 401, "Refresh token mismatch");
    }

    const accessToken = generateTokens(user._id, "access", session._id);
    const refreshToken = generateTokens(user._id, "refresh", session._id);

    session.refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await session.save();
    user.refreshToken = refreshToken;
    await user.save();

    cookieResponse(res, refreshToken);

    return apiResponse(res, 200, "Token refreshed successfully", {
      accessToken,
    });
  } catch (error) {
    return apiResponse(res, 401, "Invalid or expired refresh token");
  }
};

export const logout = async (req, res) => {
  const session = req.session;
  session.isRevoked = true;
  await session.save();

  res.clearCookie("refreshToken");
  return apiResponse(res, 200, "logout successFully");
};
export const getMe = async (req, res) => {
  const user = req.user;

  const data = {
    user: {
      displayName: user.displayName,
      email: user.email,
      id: user.id,
    },
  };

  return apiResponse(res, 200, "user fetched successFully", data);
};
