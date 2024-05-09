const mongoose = require("mongoose");
const { connect } = require("../db.js");
const { faker } = require("@faker-js/faker");
const { Author } = require("../models/Author.js");

const authorList = [
  { name: "Gabriel García Márquez", country: "Colombia" },
  { name: "Jane Austen", country: "England" },
  { name: "Leo Tolstoy", country: "Russia" },
  { name: "Virginia Woolf", country: "England" },
  { name: "Ernest Hemingway", country: "United States" },
  { name: "Jorge Luis Borges", country: "Argentina" },
  { name: "Franz Kafka", country: "Czechoslovakia" },
  { name: "Toni Morrison", country: "United States" },
  { name: "Haruki Murakami", country: "Japan" },
  { name: "Chinua Achebe", country: "Nigeria" },
];

// Creamos autores adicionales
for (let i = 0; i < 50; i++) {
  const newAuthor = {
    name: faker.person.firstName(),
    country: faker.location.country()
  };
  authorList.push(newAuthor);
}

async function populateBooks() {
  try {
    await connect();
    console.log("Tenemos conexión");

    // Borrar datos
    await Author.collection.drop();
    console.log("Atutores eliminados");

    // Añadimos autores
    const documents = authorList.map((author) => new Author(author));
    await Author.insertMany(documents);
    console.log("Datos guardados correctamente!");
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

populateBooks();
