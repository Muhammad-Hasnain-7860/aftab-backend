import {Router} from 'express'
import passport from 'passport'
import { googleAuth, logout, refresh , getMe} from '../controller/auth.controller.js'
import { refreshValid } from '../validation/auth.valid.js'
import { authentication } from '../middleware/auth.middleware.js'
const authRouter = Router()

authRouter.get('/google' , passport.authenticate('google' , {
    scope : ['profile' , 'email'],
    session : false,
    prompt : 'select_account'
}))

authRouter.get('/google/callback' , passport.authenticate('google' , {
    failureRedirect : '/',
    session : false
}), googleAuth)

authRouter.post('/refresh' , refreshValid , refresh)
authRouter.post('/logout' , authentication , logout)
authRouter.get('/me' , authentication , getMe)
export default authRouter