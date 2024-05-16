const mongoose = require("mongoose");
const { mongoConnect } = require("../db.js");
const { Book } = require("../models/Book.js");
const { faker } = require("@faker-js/faker");
const { Author } = require("../models/Author.js");

async function populateBooks() {
  try {
    await mongoConnect();
    console.log("Tenemos conexión");

    // Borrar datos
    await Book.collection.drop();
    console.log("Libros eliminados");

    const newAuthor = new Author({
      name: "Pablo",
      country: "SPAIN"
    });

    const seedAuthor = await newAuthor.save();

    const bookList = [
      {
        title: "Harry Potter",
        author: seedAuthor,
        pages: 543,
      },
      {
        title: "1984",
        author: seedAuthor,
        pages: 328,
      },
      {
        title: "To Kill a Mockingbir",
        author: seedAuthor,
        pages: 281,
      },
      {
        title: "The Great Gatsby",
        author: seedAuthor,
        pages: 180,
      },
      {
        title: "Pride and Preju",
        author: seedAuthor,
        pages: 279,
      },
    ];

    // Creamos usuarios adicionales
    for (let i = 0; i < 50; i++) {
      const newUser = {
        title: faker.person.firstName(),
        pages: faker.number.int({ min: 300, max: 600 }),
      };
      bookList.push(newUser);
    }

    // Añadimos usuarios
    const documents = bookList.map((book) => new Book(book));
    await Book.insertMany(documents);
    console.log("Datos guardados correctamente!");
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

populateBooks();
