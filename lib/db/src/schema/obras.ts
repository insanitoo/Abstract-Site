import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const obraStatusEnum = pgEnum("obra_status", ["disponivel", "vendido"]);

export const obrasTable = pgTable("obras", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  dimensoes: text("dimensoes"),
  preco: text("preco"),
  status: obraStatusEnum("status").notNull().default("disponivel"),
  imagemUrl: text("imagem_url"),
  dataCriacao: timestamp("data_criacao", { withTimezone: true }).notNull().defaultNow(),
});

export const insertObraSchema = createInsertSchema(obrasTable).omit({ id: true, dataCriacao: true });
export type InsertObra = z.infer<typeof insertObraSchema>;
export type Obra = typeof obrasTable.$inferSelect;
