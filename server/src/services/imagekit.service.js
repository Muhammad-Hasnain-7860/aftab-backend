import ImageKit, { toFile } from "@imagekit/nodejs";
import config from "../config/dotenv.js";

const client = new ImageKit({
    privateKey : config.IMAGE_KIT_PRIVATE,
    timeout: 10 * 60 * 1000, // 5 minutes
})

const uploadPhoto = async (buffer, fileName) => {
  const result = await client.files.upload({
    file: await toFile(buffer, fileName),
    fileName,
    folder: "/thumbnails",
  });

  return result;
};

export default uploadPhoto