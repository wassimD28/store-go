import * as schema from "./schema";
import { pgGenerate } from "drizzle-dbml-generator";

// Output file path
pgGenerate({
  schema,
  out: "./schema.dbml",
  relational: true,
});
