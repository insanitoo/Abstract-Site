import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cursosTable = pgTable("cursos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  imagemCapaUrl: text("imagem_capa_url"),
  chaveAcesso: text("chave_acesso").notNull(),
  aulas: text("aulas"),
  dataCriacao: timestamp("data_criacao", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCursoSchema = createInsertSchema(cursosTable).omit({ id: true, dataCriacao: true });
export type InsertCurso = z.infer<typeof insertCursoSchema>;
export type Curso = typeof cursosTable.$inferSelect;
