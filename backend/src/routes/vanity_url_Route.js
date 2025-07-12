
// src/routes/vanity_url_routes.js
import express from 'express';
import { 
  generateVanitySuggestions, 
  createVanityUrl, 
  checkVanityAvailability, 
  getUserVanityUrls, 
  updateVanityUrl 
} from '../controllers/vanity_url_controller.js';
import { authMiddleWare } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleWare);
router.post('/suggestions', generateVanitySuggestions);
router.post('/create', createVanityUrl);
router.get('/check-availability', checkVanityAvailability);
router.get('/', getUserVanityUrls);
router.put('/:id', updateVanityUrl);

export default router;