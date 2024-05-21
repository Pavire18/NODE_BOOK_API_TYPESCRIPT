import { authorRouter } from "./routes/author.routes";
import { bookRouter } from "./routes/book.routes";

import { type Request, type Response, type NextFunction, type ErrorRequestHandler } from "express";

import express from "express";
import cors from "cors";
import { mongoConnect } from "./databases/mongo-db";
// import { companyRouter } from "./routes/techCompany.routes";
import { swaggerOptions } from "./swagger-options";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

// Configuración del server
const PORT = 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Swagger
const specs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Rutas
const router = express.Router();
router.get("/", (req: Request, res: Response) => {
  res.send(`Esta es la home de nuestra API.`);
});
router.get("*", (req: Request, res: Response) => {
  res.status(404).send("Lo sentimos :( No hemos encontrado la página solicitada.");
});

// Middlewares de aplicación, por ejemplo middleware de logs en consola
app.use((req: Request, res: Response, next: NextFunction) => {
  const date = new Date();
  console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date.toString()}`);
  next();
});

// Middlewares de aplicación, por ejemplo middleware de logs en consola
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Conexión a la BBDD
  await mongoConnect();
  next();
});

app.use("/book", bookRouter);
app.use("/author", authorRouter);
app.use("/public", express.static("public"));
//app.use("/company", companyRouter)
// app.use("/file-upload", fileUploadRouter);
app.use("/", router);

// Middleware de gestión de errores
app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  console.log("*** INICIO DE ERROR ***");
  console.log(`PETICIÓN FALLIDA: ${req.method} a la url ${req.originalUrl}`);
  console.log(err);
  console.log("*** FIN DE ERROR ***");

  // Truco para quitar el tipo a una variable
  const errorAsAny: any = err as unknown as any;

  if (err?.name === "ValidationError") {
    res.status(400).json(err);
  } else if (errorAsAny.errmsg?.indexOf("duplicate key") !== -1) {
    res.status(400).json({ error: errorAsAny.errmsg });
  } else {
    res.status(500).json(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server levantado en el puerto ${PORT}`);
});

// Vercel lo necesita
module.exports = app;
