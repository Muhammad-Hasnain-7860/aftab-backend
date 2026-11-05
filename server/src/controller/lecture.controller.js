import { apiResponse } from "../utils/api.utils.js";
import axios from "axios";
import { configBunny } from "../services/bunnystream.js";
import crypto from "node:crypto";
import uploadSessionModel from "../model/upload.model.js";
import lectureModel from "../model/lecture.model.js";

export const createVideo = async (req, res) => {
  const { title } = req.body;

  let newUploadSession;

  try {
    newUploadSession = await uploadSessionModel.create({
      adminId: req.user.id,
      title,
      status: "active",
    });

    const response = await axios.post(
      `https://video.bunnycdn.com/library/${configBunny.LIBRARY_ID}/videos`,
      { title },
      {
        headers: {
          AccessKey: configBunny.API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    newUploadSession.videoId = response.data.guid;
    await newUploadSession.save();

    return apiResponse(res, 200, "Video Id Created Successfully", {
      videoId: response.data.guid,
    });
  } catch (error) {
    if (error.code === 11000) {
      return apiResponse(
        res,
        400,
        "An active upload session already exists for this admin.",
      );
    }

    if (newUploadSession) {
      await uploadSessionModel.findByIdAndUpdate(newUploadSession._id, {
        status: "failed",
        failedSeen: true,
      });
    }

    return apiResponse(res, 500, "Something went wrong", error.message);
  }
};
export const uploadAuth = async (req, res) => {
  const videoId = req.params.videoId;

  try {
    const activeSession = await uploadSessionModel.findOne({
      adminId: req.user.id,
      videoId,
      status: "active",
    });

    if (!activeSession) {
      return apiResponse(
        res,
        400,
        "No active upload session found for this video.",
      );
    }

    // 2. Verify video on Bunny
    await axios.get(
      `https://video.bunnycdn.com/library/${configBunny.LIBRARY_ID}/videos/${videoId}`,
      {
        headers: {
          AccessKey: configBunny.API_KEY,
          Accept: "application/json",
        },
      },
    );

    const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 6;

    const signature = crypto
      .createHash("sha256")
      .update(configBunny.LIBRARY_ID + configBunny.API_KEY + expires + videoId)
      .digest("hex");

    return apiResponse(res, 200, "Upload authorized", {
      videoId,
      libraryId: configBunny.LIBRARY_ID,
      authorizationSignature: signature,
      authorizationExpire: expires,
    });
  } catch (error) {
    return apiResponse(
      res,
      error.response ? 502 : 500,
      "Something went wrong",
      error.response?.data || error.message,
    );
  }
};

export const completeVideo = async (req, res) => {
  const { videoId } = req.params;
  const { courseId, order } = req.body;

  try {
    const activeSession = await uploadSessionModel.findOne({
      adminId: req.user.id,
      videoId,
      status: "active",
    });

    if (!activeSession) {
      const done = await uploadSessionModel.findOne({
        adminId: req.user.id,
        videoId,
        status: "completed",
      });
      if (done) return apiResponse(res, 200, "Already completed.");

      const failed = await uploadSessionModel.findOne({
        adminId: req.user.id,
        videoId,
        status: "failed",
      });

      if (failed) {
        await uploadSessionModel.updateOne(
          { _id: failed._id },
          { failedSeen: true },
        );
        return apiResponse(
          res,
          400,
          "Video upload/process fail ho gayi. Dobara upload karo.",
        );
      }

      return apiResponse(res, 400, "No active upload session found.");
    }

    const s = await axios.get(
      `https://video.bunnycdn.com/library/${configBunny.LIBRARY_ID}/videos/${videoId}`,
      {
        headers: {
          AccessKey: configBunny.API_KEY,
          Accept: "application/json",
        },
      },
    );

    if (s.data.status === 5 || s.data.status === 6) {
      activeSession.status = "failed";
      activeSession.failedSeen = true;
      await activeSession.save();
      await deleteBunnyVideo(videoId);
      return apiResponse(res, 400, "Bunny pe upload/encoding fail hui.");
    }

    if (s.data.status === 0) {
      if (!activeSession.firstCompleteCheckAt) {
        activeSession.firstCompleteCheckAt = new Date();
        await activeSession.save();
      }
      const waited = (Date.now() - activeSession.firstCompleteCheckAt) / 1000;
      if (waited > 600) {
        activeSession.status = "failed";
        activeSession.failedSeen = true;
        await activeSession.save();
        await deleteBunnyVideo(videoId);
        return apiResponse(
          res,
          400,
          "Upload complete nahi hua, dobara try karo.",
        );
      }
      return apiResponse(res, 202, "Check ho raha hai.");
    }

    if (s.data.status < 4)
      return apiResponse(
        res,
        202,
        "Processing ho rahi hai. 10 ya 20 min baad dobara check karo. reload kar karo.",
      );

    try {
      await lectureModel.updateOne(
        { "videoUrl.videoId": videoId },
        {
          $setOnInsert: {
            title: activeSession.title,
            courseId,
            order,
            duration: s.data.length || 0,
            videoUrl: {
              videoId,
              libraryId: configBunny.LIBRARY_ID,
              playbackUrl: `https://iframe.mediadelivery.net/embed/${configBunny.LIBRARY_ID}/${videoId}`,
            },
          },
        },
        { upsert: true },
      );
    } catch (e) {
      if (e.code !== 11000) throw e;
    }

    activeSession.status = "completed";
    await activeSession.save();

    return apiResponse(
      res,
      200,
      "Video uploaded and Lecture created successfully.",
    );
  } catch (error) {
    return apiResponse(
      res,
      error.response ? 502 : 500,
      "Something went wrong",
      error.response?.data || error.message,
    );
  }
};

export const checkActiveUpload = async (req, res) => {
  try {
    const session = await uploadSessionModel.findOne({
      adminId: req.user.id,
      status: "active",
    });
    if (!session) {
      const failed = await uploadSessionModel
        .findOne({ adminId: req.user.id, status: "failed", failedSeen: false })
        .sort({ _id: -1 });

      if (failed) {
        failed.failedSeen = true;
        await failed.save();
        return apiResponse(res, 200, "Pichli upload fail ho gayi.", {
          state: "failed",
        });
      }
      return apiResponse(res, 200, "No active session", null);
    }

    let data;
    try {
      ({ data } = await axios.get(
        `https://video.bunnycdn.com/library/${configBunny.LIBRARY_ID}/videos/${session.videoId}`,
        { headers: { AccessKey: configBunny.API_KEY } },
      ));
    } catch (e) {
      if (e.response?.status === 404) {
        session.status = "failed";
        session.failedSeen = true;
        await session.save();
        return apiResponse(
          res,
          200,
          "Video Bunny par nahi mili, session band kar diya.",
          {
            state: "failed",
          },
        );
      }
      throw e;
    }

    if (data.status === 0 || data.status === 5 || data.status === 6) {
      session.status = "failed";
      session.failedSeen = true;
      await session.save();
      await deleteBunnyVideo(session.videoId);
      return apiResponse(res, 200, "Upload adhoora tha, failed kar diya.", {
        state: "failed",
      });
    }

    if (data.status >= 4) {
      await finalizeVideo(session.videoId);
      return apiResponse(res, 200, "Video ready.", { state: "completed" });
    }

    return apiResponse(
      res,
      200,
      "Processing chal rahi hai 10 ya 20 min bad reload karo",
      {
        state: "processing",
      },
    );
  } catch (error) {
    return apiResponse(res, 500, "Something went wrong", error.message);
  }
};

export const finalizeVideo = async (videoId) => {
  const session = await uploadSessionModel.findOne({
    videoId,
    status: "active",
  });
  if (!session) return;

  const { data } = await axios.get(
    `https://video.bunnycdn.com/library/${configBunny.LIBRARY_ID}/videos/${videoId}`,
    { headers: { AccessKey: configBunny.API_KEY } },
  );

  if (data.status === 5 || data.status === 6) {
    session.status = "failed";
    await session.save();
    await deleteBunnyVideo(videoId);
    return;
  }
  if (data.status < 4) return;

  try {
    await lectureModel.updateOne(
      { "videoUrl.videoId": videoId },
      {
        $setOnInsert: {
          title: session.title,
          courseId: session.courseId,
          order: session.order,
          duration: data.length || 0,
          videoUrl: {
            videoId,
            libraryId: configBunny.LIBRARY_ID,
            playbackUrl: `https://iframe.mediadelivery.net/embed/${configBunny.LIBRARY_ID}/${videoId}`,
          },
        },
      },
      { upsert: true },
    );
  } catch (e) {
    if (e.code !== 11000) throw e;
  }
  session.status = "completed";
  await session.save();
};

export const bunnyWebhook = async (req, res) => {
  const signature = req.headers["x-bunnystream-signature"] || "";
  const expected = crypto
    .createHmac("sha256", configBunny.READ_ONLY_API_KEY)
    .update(req.body)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).send("Invalid signature");
  }

  

  try {
        const { VideoGuid, Status } = JSON.parse(req.body.toString());

    if (VideoGuid) {
      if (Status === 5 || Status === 8) {
        await uploadSessionModel.updateOne(
          { videoId: VideoGuid, status: "active" },
          { $set: { status: "failed" } },
        );
        await deleteBunnyVideo(VideoGuid);
      } else if (Status === 3) {
        await finalizeVideo(VideoGuid);
      }
    }

  } catch (e) {
    console.log("webhook error:", e.message);
  }

    return res.sendStatus(200);
};

const deleteBunnyVideo = async (videoId) => {
  try {
    await axios.delete(
      `https://video.bunnycdn.com/library/${configBunny.LIBRARY_ID}/videos/${videoId}`,
      { headers: { AccessKey: configBunny.API_KEY } },
    );
  } catch (e) {
    console.log("Bunny delete failed:", e.message);
  }
};
