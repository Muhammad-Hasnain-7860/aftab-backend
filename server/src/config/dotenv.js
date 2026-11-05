import dotenv from 'dotenv'
dotenv.config()

const config = {
    PORT : process.env.PORT,
    MONGODB_URI : process.env.MONGODB_URI,
    JWT_SECRET : process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_CALLBACK : process.env.GOOGLE_REDIRECT_CALLBACK,
    ACCESS_SECRET : process.env.ACCESS_SECRET,
    REFRESH_SECRET : process.env.REFRESH_SECRET,
    ACCESS_EXPIRE : process.env.ACCESS_EXPIRE,
    REFRESH_EXPIRE : process.env.REFRESH_EXPIRE,
    URL_ENDPOINT : process.env.URL_ENDPOINT,
    IMAGE_KIT_PRIVATE : process.env.IMAGE_KIT_PRIVATE,
    IMAGE_KIT_PUBLIC : process.env.IMAGE_KIT_PUBLIC,
    BUNNY_API_KEY : process.env.BUNNY_API_KEY,
    BUNNY_HOST : process.env.BUNNY_HOST,
    BUNNY_LIBRARY_ID : process.env.BUNNY_LIBRARY_ID,
    READ_ONLY_API_KEY : process.env.READ_ONLY_API_KEY
}

export default config