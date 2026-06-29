import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const obraStatusEnum = pgEnum("obra_status", ["disponivel", "vendido"]);
export const obraTamanhoEnum = pgEnum("obra_tamanho", ["grande", "media", "pequena"]);

export const obrasTable = pgTable("obras", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  tecnica: text("tecnica"),
  dimensoes: text("dimensoes"),
  preco: text("preco"),
  status: obraStatusEnum("status").notNull().default("disponivel"),
  tamanho: obraTamanhoEnum("tamanho"),
  imagemUrl: text("imagem_url"),
  imagemUrl2: text("imagem_url2"),
  imagemUrl3: text("imagem_url3"),
  dataCriacao: timestamp("data_criacao", { withTimezone: true }).notNull().defaultNow(),
});

export const insertObraSchema = createInsertSchema(obrasTable).omit({ id: true, dataCriacao: true });
export type InsertObra = z.infer<typeof insertObraSchema>;
export type Obra = typeof obrasTable.$inferSelect;
