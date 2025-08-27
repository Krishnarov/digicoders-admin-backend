import express from "express";
import { createHr, deletaHr, getAllHr, updataHr } from "../controllers/manageHrController.js";

const route=express.Router()

route.post('/',createHr)
route.get('/',getAllHr)
route.put('/:id',updataHr)
route.delete('/:id',deletaHr)

export default route