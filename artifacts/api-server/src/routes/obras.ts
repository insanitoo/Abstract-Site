import { Router, type IRouter } from "express";
import { db, obrasTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListObrasQueryParams,
  CreateObraBody,
  GetObraParams,
  UpdateObraParams,
  UpdateObraBody,
  DeleteObraParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/obras", async (req, res): Promise<void> => {
  const query = ListObrasQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let obras = await db.select().from(obrasTable);

  // Ordem definida pelo admin (sempre presente)
  obras.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  if (query.data.status) {
    obras = obras.filter((o) => o.status === query.data.status);
  }
  if (query.data.tamanho) {
    obras = obras.filter((o) => o.tamanho === query.data.tamanho);
  }
  if (query.data.limit) {
    obras = obras.slice(0, query.data.limit);
  }

  res.json(obras.map(serializeObra));
});

router.post("/obras", async (req, res): Promise<void> => {
  const parsed = CreateObraBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [obra] = await db.insert(obrasTable).values(parsed.data).returning();
  res.status(201).json(serializeObra(obra));
});

router.post("/obras/reordenar", async (req, res): Promise<void> => {
  const items: { id: number; ordem: number }[] = req.body;
  if (!Array.isArray(items)) {
    res.status(400).json({ error: "Expected array of {id, ordem}" });
    return;
  }
  await Promise.all(
    items.map(({ id, ordem }) =>
      db.update(obrasTable).set({ ordem }).where(eq(obrasTable.id, id))
    )
  );
  res.json({ ok: true });
});

router.get("/obras/:id", async (req, res): Promise<void> => {
  const params = GetObraParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [obra] = await db.select().from(obrasTable).where(eq(obrasTable.id, params.data.id));
  if (!obra) {
    res.status(404).json({ error: "Obra não encontrada" });
    return;
  }

  res.json(serializeObra(obra));
});

router.patch("/obras/:id", async (req, res): Promise<void> => {
  const params = UpdateObraParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateObraBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [obra] = await db
    .update(obrasTable)
    .set(parsed.data)
    .where(eq(obrasTable.id, params.data.id))
    .returning();

  if (!obra) {
    res.status(404).json({ error: "Obra não encontrada" });
    return;
  }

  res.json(serializeObra(obra));
});

router.delete("/obras/:id", async (req, res): Promise<void> => {
  const params = DeleteObraParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [obra] = await db.delete(obrasTable).where(eq(obrasTable.id, params.data.id)).returning();
  if (!obra) {
    res.status(404).json({ error: "Obra não encontrada" });
    return;
  }

  res.sendStatus(204);
});

function serializeObra(obra: typeof obrasTable.$inferSelect) {
  return {
    id: obra.id,
    titulo: obra.titulo,
    descricao: obra.descricao,
    tecnica: obra.tecnica,
    dimensoes: obra.dimensoes,
    preco: obra.preco,
    status: obra.status,
    tamanho: obra.tamanho,
    imagemUrl: obra.imagemUrl,
    imagemUrl2: obra.imagemUrl2,
    imagemUrl3: obra.imagemUrl3,
    imagemUrl4: obra.imagemUrl4,
    destaque: obra.destaque,
    ordem: obra.ordem,
    desconto: obra.desconto,
    dataCriacao: obra.dataCriacao instanceof Date ? obra.dataCriacao.toISOString() : obra.dataCriacao,
  };
}

export default router;
