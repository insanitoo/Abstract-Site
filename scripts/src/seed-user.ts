/**
 * Cria um utilizador na base de dados.
 *
 * Uso:
 *   USERNAME=DiolenyIntya PASSWORD=Odoido26_ pnpm --filter @workspace/scripts tsx src/seed-user.ts
 *
 * Se USERNAME/PASSWORD não forem fornecidos via env, pode passá-los como argumentos:
 *   pnpm --filter @workspace/scripts tsx src/seed-user.ts DiolenyIntya Odoido26_
 */
import bcrypt from "bcryptjs";
import { db, usuariosTable } from "@workspace/db";

const username = process.env.USERNAME ?? process.argv[2];
const password = process.env.PASSWORD ?? process.argv[3];

if (!username || !password) {
  console.error("❌  Uso: USERNAME=<user> PASSWORD=<pass> tsx src/seed-user.ts");
  console.error("        ou: tsx src/seed-user.ts <username> <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

try {
  await db.insert(usuariosTable).values({ username, passwordHash: hash });
  console.log(`✅  Utilizador "${username}" criado com sucesso.`);
} catch (err: unknown) {
  if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505") {
    console.log(`ℹ️  O utilizador "${username}" já existe.`);
  } else {
    console.error("❌  Erro ao criar utilizador:", err);
    process.exit(1);
  }
}
