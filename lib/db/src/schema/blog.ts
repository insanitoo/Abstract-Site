import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blogTable = pgTable("blog", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  conteudo: text("conteudo").notNull(),
  imagemCapaUrl: text("imagem_capa_url"),
  dataPublicacao: timestamp("data_publicacao", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBlogSchema = createInsertSchema(blogTable).omit({ id: true, dataPublicacao: true });
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type BlogPost = typeof blogTable.$inferSelect;
