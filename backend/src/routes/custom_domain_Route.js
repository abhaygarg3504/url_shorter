// src/routes/custom_domain_routes.js
import express from 'express';
import { 
  addCustomDomain, 
  verifyDomain, 
  getUserDomains, 
  deleteCustomDomain, 
  checkDomainAvailability 
} from '../controllers/custom_domain_controller.js';
import { authMiddleWare } from '../middleware/auth.js';
import { validateCustomDomain } from '../middleware/domain_middleware.js';

const router = express.Router();
router.use(authMiddleWare);
router.post('/add', validateCustomDomain, addCustomDomain);
router.post('/verify/:domainId', verifyDomain);
router.get('/', getUserDomains);
router.delete('/:domainId', deleteCustomDomain);
router.get('/check-availability', checkDomainAvailability);

export default router;
