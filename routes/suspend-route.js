import express from 'express';
import { suspend } from '../controllers/suspend-controller.js';

const router = express.Router();

router.post('/', suspend);

export default router