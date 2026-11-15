import express from "express";
import app from './src/app/app.js'
import connectDB from './src/config/db.js'
import config from './src/config/dotenv.js'
import {createServer} from 'node:http'
import { socketServer } from "./src/services/socket.server.js";

const httpServer = createServer(app)
await connectDB()

socketServer(httpServer)

httpServer.listen(config.PORT || 3000, () => {
    console.log('server is running successFully')
})

