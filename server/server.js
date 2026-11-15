import express from "express";
import app from './src/app/app.js'
import connectDB from './src/config/db.js'
import config from './src/config/dotenv.js'
import {createServer} from 'node:http'
import { socketServer } from "./src/services/socket.server.js";
import userModel from "./src/model/auth.model.js";
import mongoose from "mongoose";

const httpServer = createServer(app)
await connectDB()

socketServer(httpServer)

httpServer.listen(config.PORT || 3000, () => {
    console.log('server is running successFully')
})
await userModel.findByIdAndUpdate('6af9efacde417e6072d4a9ee', {
    course: new mongoose.Types.ObjectId('6af48e9abfacf564ccf0a117')
})