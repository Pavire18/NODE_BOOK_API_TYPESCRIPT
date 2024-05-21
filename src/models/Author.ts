import validator from "validator";
import mongoose from "mongoose";



/**
 * @swagger
 * components:
 *  schemas:
 *    Author:
 *      type: object
 *      required:
 *        - name
 *        - password
 *        - email
 *        - country
 *      properties:
 *        name:
 *          type: string
 *          description: Name of the author
 *        password:
 *          type: string
 *          description: password of the author
 *        country:
 *          type: string
 *          description: Country of this Author. (sample SPAIN)
 *        image:
 *          type: string
 *          description: Logo of this brand (sample http://balbblabla.com/image.jpg)
 */

const Schema = mongoose.Schema;

const allowedCountries: string[] = ["SPAIN", "ITALY", "USA", "GERMANY", "JAPAN", "FRANCE"];

interface IAuthor {
  email: string;
  password: string;
  name: string;
  country: string;
  image: string;
}

// Creamos el schema del usuario
const authorSchema = new Schema<IAuthor>(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      validate: {
        validator: (value: string) => {
          return validator.isEmail(value);
        },
        message: 'Email incorrecto',
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minLength: [8, "La contraseña debe tener al menos 8 caracteres"],
      select: false,
    },
    name: {
      type: String,
      required: true,
      minLength: [3, "Al menos 3 letras para el nombre."],
      maxLength: [20, "Máximo 20 letras para el nombre."],
      trim: true,
    },
    country: {
      type: String,
      required: true,
      enum: allowedCountries,
      uppercase: true,
      trim: true,
    },
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Author = mongoose.model<IAuthor>("Author", authorSchema);

