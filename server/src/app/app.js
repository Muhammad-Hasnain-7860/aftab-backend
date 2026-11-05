import express from "express";
import passport from "../config/passport.js";
import authRouter from "../router/auth.route.js";
import cookieParser from "cookie-parser";
import courseRouter from "../router/course.route.js";
import lectureRouter from "../router/lecture.route.js";
import cors from "cors";
import {bunnyWebhook} from '../controller/lecture.controller.js'
const app = express();
app.post("/api/webhook/bunny", express.raw({ type: "*/*" }), bunnyWebhook);
app.use(cors({
  origin: "https://frontend-aftab.vercel.app",
  credentials: true,
}))
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use("/api/course", courseRouter);
app.use("/api/auth", authRouter);
app.use("/api/lecture", lectureRouter);

app.get('/', (req , res)=>{
  res.send('server is running successFully')
})
export default app;
