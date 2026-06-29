import { Router, type IRouter } from "express";
import { db, cursosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateCursoBody,
  GetCursoParams,
  UpdateCursoParams,
  UpdateCursoBody,
  DeleteCursoParams,
  VerificarChaveCursoParams,
  VerificarChaveCursoBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/cursos", async (_req, res): Promise<void> => {
  const cursos = await db.select().from(cursosTable).orderBy(cursosTable.dataCriacao);
  res.json(cursos.reverse().map(serializeCurso));
});

router.post("/cursos", async (req, res): Promise<void> => {
  const parsed = CreateCursoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [curso] = await db.insert(cursosTable).values(parsed.data).returning();
  res.status(201).json(serializeCurso(curso));
});

router.get("/cursos/:id", async (req, res): Promise<void> => {
  const params = GetCursoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [curso] = await db.select().from(cursosTable).where(eq(cursosTable.id, params.data.id));
  if (!curso) {
    res.status(404).json({ error: "Curso não encontrado" });
    return;
  }

  res.json(serializeCurso(curso));
});

router.patch("/cursos/:id", async (req, res): Promise<void> => {
  const params = UpdateCursoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCursoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [curso] = await db
    .update(cursosTable)
    .set(parsed.data)
    .where(eq(cursosTable.id, params.data.id))
    .returning();

  if (!curso) {
    res.status(404).json({ error: "Curso não encontrado" });
    return;
  }

  res.json(serializeCurso(curso));
});

router.delete("/cursos/:id", async (req, res): Promise<void> => {
  const params = DeleteCursoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [curso] = await db.delete(cursosTable).where(eq(cursosTable.id, params.data.id)).returning();
  if (!curso) {
    res.status(404).json({ error: "Curso não encontrado" });
    return;
  }

  res.sendStatus(204);
});

router.post("/cursos/:id/verificar-chave", async (req, res): Promise<void> => {
  const params = VerificarChaveCursoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = VerificarChaveCursoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [curso] = await db.select().from(cursosTable).where(eq(cursosTable.id, params.data.id));
  if (!curso) {
    res.status(404).json({ error: "Curso não encontrado" });
    return;
  }

  if (curso.chaveAcesso === parsed.data.chave) {
    res.json({ valida: true });
  } else {
    res.status(401).json({ valida: false });
  }
});

function serializeCurso(curso: typeof cursosTable.$inferSelect) {
  return {
    id: curso.id,
    nome: curso.nome,
    descricao: curso.descricao,
    imagemCapaUrl: curso.imagemCapaUrl,
    chaveAcesso: curso.chaveAcesso,
    aulas: curso.aulas,
    dataCriacao: curso.dataCriacao instanceof Date ? curso.dataCriacao.toISOString() : curso.dataCriacao,
  };
}

export default router;
