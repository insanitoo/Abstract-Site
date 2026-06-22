import { Router, type IRouter } from "express";
import healthRouter from "./health";
import obrasRouter from "./obras";
import eventosRouter from "./eventos";
import blogRouter from "./blog";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(obrasRouter);
router.use(eventosRouter);
router.use(blogRouter);

export default router;
