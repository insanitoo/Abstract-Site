import { Router, type IRouter } from "express";
import { db, configuracoesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/configuracoes/:chave", async (req, res): Promise<void> => {
  const { chave } = req.params;
  const [row] = await db.select().from(configuracoesTable).where(eq(configuracoesTable.chave, chave));
  if (!row) {
    res.json({ chave, valor: null });
    return;
  }
  res.json(row);
});

router.put("/configuracoes/:chave", async (req, res): Promise<void> => {
  const { chave } = req.params;
  const { valor } = req.body;
  if (typeof valor !== "string" && valor !== null) {
    res.status(400).json({ error: "valor must be a string or null" });
    return;
  }
  if (valor === null) {
    await db.delete(configuracoesTable).where(eq(configuracoesTable.chave, chave));
    res.json({ chave, valor: null });
    return;
  }
  const [row] = await db
    .insert(configuracoesTable)
    .values({ chave, valor })
    .onConflictDoUpdate({ target: configuracoesTable.chave, set: { valor } })
    .returning();
  res.json(row);
});

export default router;
