import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import b2 from "../services/backblaze.service.js";
import config from "../config/dotenv.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export const uploadAudio = async (audio, mimeType) => {
  const key = `audio/${randomUUID()}`;

  await b2.send(
    new PutObjectCommand({
      Bucket: config.KEY_NAME,
      Key: key,
      Body: audio,
      ContentType: mimeType,
    })
  );

  return key;
};


export const getAudioUrl = async (key) => {
  return getSignedUrl(
    b2,
    new GetObjectCommand({
      Bucket: config.KEY_NAME,
      Key: key,
    }),
    { expiresIn: 3600 }
  );
};