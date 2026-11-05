import config from '../config/dotenv.js'

export const configBunny = {
    API_KEY: config.BUNNY_API_KEY,
    HOST: config.BUNNY_HOST,
    LIBRARY_ID: config.BUNNY_LIBRARY_ID,
    READ_ONLY_API_KEY : config.READ_ONLY_API_KEY
}