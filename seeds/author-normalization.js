const { mongoose } = require("mongoose");
const { connect } = require("../db.js");
const { Author } = require("../models/Author.js");

const allowedCountries = ["SPAIN", "ITALY", "USA", "GERMANY", "JAPAN", "FRANCE"];

const authorNormalization = async () => {
  try {
    await connect();
    console.log("Conexíón realizada correctamente.");

    const authors = await Author.find();
    console.log(`Hemos recuperado ${authors.length} autores`);

    // Actualizamos los campos según las reglas de negocio que queramos
    // Podríamos incluso eliminar datos que no sean correctos
    for (let i = 0; i < authors.length; i++) {
      const author = authors[i];
      author.name = author.name.substring(0, 20).trim();

      if (allowedCountries.includes(author.country.toUpperCase().trim())) {
        author.country = author.country.toUpperCase().trim();
      } else {
        author.country = allowedCountries[Math.floor(Math.random() * 6)];
      }

      await author.save();

      console.log(`Autor modificado --> ${author.name}`);
    }

    console.log("Modificados todos los autores de nuestra base de datos");
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

authorNormalization();
