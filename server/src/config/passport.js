import passport from 'passport'
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import config from './dotenv.js'
passport.use(new GoogleStrategy({
    clientID : config.GOOGLE_CLIENT_ID,
    clientSecret : config.GOOGLE_CLIENT_SECRET,
    callbackURL : config.GOOGLE_REDIRECT_CALLBACK
}, (accessToken, refreshToken, profile, done) => {
    try {
       return done(null , profile)
    } catch (error) {
        return done(error)
    }
}))

export default passport