import express from "express";

// Modelos
import { Book } from "../models/Book";
import { paginator } from "../middlewares/paginator.middleware";

export const bookRouter = express.Router();

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


