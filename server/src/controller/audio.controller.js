import { getAudioUrl } from "../utils/b2Audio.js";

export const getAudioUrlController = async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Audio key required",
      });
    }

    const url = await getAudioUrl(key);

    res.status(200).json({
      success: true,
      url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate audio URL",
    });
  }
};
