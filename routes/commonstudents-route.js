import express from 'express';
import { getCommonStudents } from '../controllers/commonstudents-controller.js';

const router = express.Router();

router.get('/', getCommonStudents);

export default router