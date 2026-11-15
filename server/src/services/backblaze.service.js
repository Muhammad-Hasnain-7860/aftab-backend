import { S3Client } from "@aws-sdk/client-s3";
import config from '../config/dotenv.js'

const b2 = new S3Client({
  endpoint:  config.B2_ENDPOINT,
  region: config.B2_REGION,
  credentials: {
    accessKeyId: config.KEY_ID,
    secretAccessKey: config.B2_APP_KEY,
  },
});


export default b2;