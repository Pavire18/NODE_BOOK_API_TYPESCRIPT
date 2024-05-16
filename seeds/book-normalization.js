const { mongoose } = require("mongoose");
const { mongoConnect } = require("../db.js");
const { Book } = require("../models/Book.js");

const allowedCountries = ["SPAIN", "ITALY", "USA", "GERMANY", "JAPAN", "FRANCE"];

const bookNormalization = async () => {
  try {
    await mongoConnect();
    console.log("Conexíón realizada correctamente.");

    const books = await Book.find();
    console.log(`Hemos recuperado ${books.length} libros`);

    // Actualizamos los campos según las reglas de negocio que queramos
    // Podríamos incluso eliminar datos que no sean correctos
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      book.title = book.title.substring(0, 20).trim();
      book.pages = book.pages > 1000 ? 1000 : book.pages;
      book.pages = book.pages < 1 ? 1 : book.pages;

      if (book.publisher) {
        book.publisher.name = book.publisher.name.substring(0, 20).trim();

        if (allowedCountries.includes(book.publisher.country.toUpperCase().trim())) {
          book.publisher.country = book.publisher.country.toUpperCase().trim();
        } else {
          book.publisher.country = allowedCountries[Math.floor(Math.random() * 6)];
        }
      }

      await book.save();

      console.log(`Libro modificado --> ${book.title}`);
    }

    console.log("Modificados todos los libros de nuestra base de datos");
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

bookNormalization();
