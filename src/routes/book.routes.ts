import express from "express";
/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management
 */

// Modelos
import { Book } from "../models/mongo/Book";
import { paginator } from "../middlewares/paginator.middleware";

export const bookRouter = express.Router();


/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve a list of books with pagination
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A paginated list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 */
bookRouter.get("/", paginator, async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const books = await Book.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("author");

    const totalElements = await Book.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: books,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Retrieve a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: A single book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
bookRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const book = await Book.findById(id).populate("author");
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /books/title/{title}:
 *   get:
 *     summary: Retrieve books by title
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Book title
 *     responses:
 *       200:
 *         description: A list of books with the specified title
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: No books found
 *       500:
 *         description: Internal server error
 */
bookRouter.get("/title/:title", async (req, res, next) => {
  const title = req.params.title;

  try {
    const book = await Book.find({ title }).populate("author");
    if (book?.length) {
      res.json(book);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - pages
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               pages:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The created book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 */
// Endpoint de creación de usuarios
bookRouter.post("/", async (req, res, next) => {
  try {
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages,
    });

    const createdBook = await book.save();
    return res.status(201).json(createdBook);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: The deleted book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */

bookRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const bookDeleted = await Book.findByIdAndDelete(id);
    if (bookDeleted) {
      res.json(bookDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               pages:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The updated book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
bookRouter.put("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const bookUpdated = await Book.findByIdAndUpdate(id, req.body, { new: true });
    if (bookUpdated) {
      res.json(bookUpdated);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});


