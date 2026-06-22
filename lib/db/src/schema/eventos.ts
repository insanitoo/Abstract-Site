import { pgTable, text, serial, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventoTipoEnum = pgEnum("evento_tipo", ["futuro", "passado"]);

export const eventosTable = pgTable("eventos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  local: text("local"),
  dataEvento: date("data_evento", { mode: "string" }).notNull(),
  tipo: eventoTipoEnum("tipo").notNull(),
  descricao: text("descricao"),
  imagemCapaUrl: text("imagem_capa_url"),
  imagensAdicionais: text("imagens_adicionais"),
  linkInscricao: text("link_inscricao"),
});

export const insertEventoSchema = createInsertSchema(eventosTable).omit({ id: true });
export type InsertEvento = z.infer<typeof insertEventoSchema>;
export type Evento = typeof eventosTable.$inferSelect;
