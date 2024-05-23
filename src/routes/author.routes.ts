import express from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import fs from "fs";
import { generateToken } from "../utils/token";

/**
 * @swagger
 * tags:
 *   name: Author
 *   description: The author managing API
 */

// Modelos
import { Author } from "../models/mongo/Author";
import { isAuth } from "../middlewares/auth.middleware";
import { paginator } from "../middlewares/paginator.middleware";

const upload = multer({ dest: "public" });

export const authorRouter = express.Router();

// router.get("/", paginator, async (req, res, next) => {
//   try {
//     const { page, limit } = req;
//     const users = await Author.find()
//       .limit(limit)
//       .skip((page - 1) * limit);

//     const totalElements = await Author.countDocuments();

//     const response = {
//       totalItems: totalElements,
//       totalPages: Math.ceil(totalElements / limit),
//       currentPage: page,
//       data: users,
//     };

//     res.json(response);
//   } catch (error) {
//     next(error);
//   }
// });

/**
 * @swagger
 * /author:
 *   get:
 *     summary: Lists all the athors
 *     tags: [Author]
 *     responses:
 *       200:
 *         description: The list of the authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Author'
 * 
 */

authorRouter.get("/", paginator, async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const authors = await Author.find()
      .limit(limit)
      .skip((page - 1) * limit);

    const totalElements = await Author.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: authors,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /author/{id}:
 *   get:
 *     summary: Get a author by ID
 *     tags: [Author]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The author ID
 *     responses:
 *       200:
 *         description: The author info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 */
authorRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const author = await Author.findById(id);
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});



/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Crear un nuevo autor
 *     tags: [Author]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *     responses:
 *       201:
 *         description: Autor creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       400:
 *         description: Error en la solicitud.
 *       500:
 *         description: Error del servidor.
 */
authorRouter.post("/", async (req, res, next) => {
  try {
    const author = new Author(req.body);

    const createdAuthor = await author.save();
    return res.status(201).json(createdAuthor);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Eliminar un autor por ID
 *     tags: [Author]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del autor
 *     responses:
 *       200:
 *         description: Autor eliminado exitosamente.
 *       404:
 *         description: Autor no encontrado.
 *       500:
 *         description: Error del servidor.
 */
authorRouter.delete("/:id", isAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const authorDeleted = await Author.findByIdAndDelete(id);
    if (authorDeleted) {
      res.json(authorDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Actualizar un autor por ID
 *     tags: [Author]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del autor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *     responses:
 *       200:
 *         description: Autor actualizado exitosamente.
 *       404:
 *         description: Autor no encontrado.
 *       500:
 *         description: Error del servidor.
 */
authorRouter.put("/:id", isAuth, async (req, res, next) => {
  try {
    const id = req.params.id;

    const authorUpdated = await Author.findByIdAndUpdate(id, req.body, { new: true });
    if (authorUpdated) {
      res.json(authorUpdated);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /authors/image-upload:
 *   post:
 *     summary: Subir una imagen para un autor
 *     tags: [Author]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               brandId:
 *                 type: string
 *                 description: ID del autor
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente.
 *       404:
 *         description: Autor no encontrado.
 *       500:
 *         description: Error del servidor.
 */
authorRouter.post("/image-upload", upload.single("image"), async (req, res, next) => {
  const originalname = req.file?.originalname as string;
  const path = req.file?.path as string;
  const newPath = path + "_" + originalname;

  fs.renameSync(path, newPath);

  const authorId = req.body.brandId;
  const author = await Author.findById(authorId);

  if (author) {
    author.image = newPath;
    await author.save();
    res.json(author);

    console.log("Author modificada correctamente!");
  } else {
    fs.unlinkSync(newPath);
    res.status(404).send("Marca no encontrada");
  }
});


/**
 * @swagger
 * /authors/login:
 *   post:
 *     summary: Autenticar un autor
 *     tags: [Author]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticación exitosa.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Faltan campos obligatorios.
 *       401:
 *         description: Email y/o contraseña incorrectos.
 *       500:
 *         description: Error del servidor.
 */
authorRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Se deben especificar los campos email y password" });
    }

    const author = await Author.findOne({ email }).select("+password");
    if (!author) {
      return res.status(401).json({ error: "Email y/o contraseña incorrectos" });
    }

    const match = await bcrypt.compare(password, author.password);
    if (match) {
      const authorWithoutPass = {
        ...author.toObject(),
        password: undefined, // Omitir la propiedad password en lugar de eliminarla
      };
      const jwtToken = generateToken(author._id.toString(), author.email);

      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Email y/o contraseña incorrectos" });
    }
  } catch (error) {
    next(error);
  }
});

