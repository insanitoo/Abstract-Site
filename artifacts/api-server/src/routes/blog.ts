import { Router, type IRouter } from "express";
import { db, blogTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  ListBlogQueryParams,
  CreateBlogPostBody,
  GetBlogPostParams,
  UpdateBlogPostParams,
  UpdateBlogPostBody,
  DeleteBlogPostParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/blog", async (req, res): Promise<void> => {
  const query = ListBlogQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let q = db.select().from(blogTable).orderBy(desc(blogTable.dataPublicacao));
  let posts = await q;

  if (query.data.limit) {
    posts = posts.slice(0, query.data.limit);
  }

  res.json(posts.map(serializePost));
});

router.post("/blog", async (req, res): Promise<void> => {
  const parsed = CreateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [post] = await db.insert(blogTable).values(parsed.data).returning();
  res.status(201).json(serializePost(post));
});

router.get("/blog/:id", async (req, res): Promise<void> => {
  const params = GetBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db.select().from(blogTable).where(eq(blogTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post não encontrado" });
    return;
  }

  res.json(serializePost(post));
});

router.patch("/blog/:id", async (req, res): Promise<void> => {
  const params = UpdateBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [post] = await db
    .update(blogTable)
    .set(parsed.data)
    .where(eq(blogTable.id, params.data.id))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Post não encontrado" });
    return;
  }

  res.json(serializePost(post));
});

router.delete("/blog/:id", async (req, res): Promise<void> => {
  const params = DeleteBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db.delete(blogTable).where(eq(blogTable.id, params.data.id)).returning();
  if (!post) {
    res.status(404).json({ error: "Post não encontrado" });
    return;
  }

  res.sendStatus(204);
});

function serializePost(post: typeof blogTable.$inferSelect) {
  return {
    id: post.id,
    titulo: post.titulo,
    conteudo: post.conteudo,
    imagemCapaUrl: post.imagemCapaUrl,
    dataPublicacao: post.dataPublicacao instanceof Date ? post.dataPublicacao.toISOString() : post.dataPublicacao,
  };
}

export default router;
