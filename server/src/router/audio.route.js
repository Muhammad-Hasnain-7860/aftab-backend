import express from "express";
import { getAudioUrlController } from "../controller/audio.controller.js";
import { authentication, authorization } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/audio-url", authentication, getAudioUrlController);

export default router;