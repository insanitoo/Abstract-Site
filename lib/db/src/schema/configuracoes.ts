import { pgTable, text } from "drizzle-orm/pg-core";

export const configuracoesTable = pgTable("configuracoes", {
  chave: text("chave").primaryKey(),
  valor: text("valor").notNull(),
});

export type Configuracao = typeof configuracoesTable.$inferSelect;
