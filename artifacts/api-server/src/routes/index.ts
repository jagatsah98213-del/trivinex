import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import publicRouter from "./public";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(publicRouter);
router.use(adminRouter);

export default router;
