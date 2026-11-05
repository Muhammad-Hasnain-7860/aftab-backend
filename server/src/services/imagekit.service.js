import ImageKit, { toFile } from "@imagekit/nodejs";
import config from "../config/dotenv.js";

const client = new ImageKit({
    privateKey : config.IMAGE_KIT_PRIVATE,
    timeout: 10 * 60 * 1000, // 5 minutes
})

export default async(buffer , fileName)=>{
   const res = await client.files.upload({
    file: await toFile(buffer, "lecture.mp4"),
    fileName: fileName,
    folder : '/lectures'
    });

    console.log(res)

    return res
}