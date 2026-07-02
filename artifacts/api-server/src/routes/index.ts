import { Router, type IRouter, type Request, type Response } from "express";
import healthRouter from "./health";
import obrasRouter from "./obras";
import eventosRouter from "./eventos";
import blogRouter from "./blog";
import authRouter from "./auth";
import uploadRouter from "./upload";
import cursosRouter from "./cursos";
import configuracoesRouter from "./configuracoes";

const router: IRouter = Router();

router.get("/ping", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

router.use(healthRouter);
router.use(authRouter);
router.use(uploadRouter);
router.use(obrasRouter);
router.use(eventosRouter);
router.use(blogRouter);
router.use(cursosRouter);
router.use(configuracoesRouter);

export default router;
