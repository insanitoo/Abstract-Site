import { Router, type IRouter } from "express";
import { db, eventosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListEventosQueryParams,
  CreateEventoBody,
  GetEventoParams,
  UpdateEventoParams,
  UpdateEventoBody,
  DeleteEventoParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/eventos", async (req, res): Promise<void> => {
  const query = ListEventosQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let eventos = await db.select().from(eventosTable).orderBy(eventosTable.dataEvento);

  if (query.data.tipo) {
    eventos = eventos.filter((e) => e.tipo === query.data.tipo);
  }

  res.json(eventos.map(serializeEvento));
});

router.post("/eventos", async (req, res): Promise<void> => {
  const parsed = CreateEventoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [evento] = await db.insert(eventosTable).values(parsed.data).returning();
  res.status(201).json(serializeEvento(evento));
});

router.get("/eventos/:id", async (req, res): Promise<void> => {
  const params = GetEventoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [evento] = await db.select().from(eventosTable).where(eq(eventosTable.id, params.data.id));
  if (!evento) {
    res.status(404).json({ error: "Evento não encontrado" });
    return;
  }

  res.json(serializeEvento(evento));
});

router.patch("/eventos/:id", async (req, res): Promise<void> => {
  const params = UpdateEventoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEventoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [evento] = await db
    .update(eventosTable)
    .set(parsed.data)
    .where(eq(eventosTable.id, params.data.id))
    .returning();

  if (!evento) {
    res.status(404).json({ error: "Evento não encontrado" });
    return;
  }

  res.json(serializeEvento(evento));
});

router.delete("/eventos/:id", async (req, res): Promise<void> => {
  const params = DeleteEventoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [evento] = await db.delete(eventosTable).where(eq(eventosTable.id, params.data.id)).returning();
  if (!evento) {
    res.status(404).json({ error: "Evento não encontrado" });
    return;
  }

  res.sendStatus(204);
});

function serializeEvento(evento: typeof eventosTable.$inferSelect) {
  return {
    id: evento.id,
    nome: evento.nome,
    local: evento.local,
    dataEvento: evento.dataEvento,
    tipo: evento.tipo,
    descricao: evento.descricao,
    imagemCapaUrl: evento.imagemCapaUrl,
    imagensAdicionais: evento.imagensAdicionais,
    linkInscricao: evento.linkInscricao,
  };
}

export default router;
