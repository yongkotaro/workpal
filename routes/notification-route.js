import express from 'express';
import { retrieveStudents } from '../controllers/notification-controller.js';

const router = express.Router();

router.post('/', retrieveStudents);

export default router