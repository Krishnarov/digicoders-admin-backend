import express from "express";
import { getAll } from "../controllers/countContrallers.js";
import { auth } from '../middleware/auth.js';
const route=express.Router()

route.get('/',auth,getAll)
export default route