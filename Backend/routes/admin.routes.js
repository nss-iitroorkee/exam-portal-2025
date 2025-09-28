import { Router } from "express";
import { loginAdmin, logoutAdmin, registerAdmin } from "../controllers/admin.controller.js";

const router = Router();

router.post('/registerAdmin', registerAdmin);
router.post('/loginAdmin', loginAdmin)
router.post('/logoutAdmin', logoutAdmin)

export default router;