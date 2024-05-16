import express, { type NextFunction, type Response, type Request } from "express";
import { sqlQuery } from "../databases/sql-db";
import { type TechCompany } from "../models/sql/techCompany";
export const companyRouter = express.Router();

// CRUD: READ
companyRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await sqlQuery(`
      SELECT *
      FROM tech_company
    `);
    const response = { data: rows };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: READ
companyRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const rows = await sqlQuery(`
      SELECT *
      FROM tech_company
      WHERE id=${id}
    `);

    if (rows?.[0]) {
      const response = { data: rows?.[0] };
      res.json(response);
    } else {
      res.status(404).json({ error: "tech_company not found" });
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE
companyRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, foundedYear, employeesNumber, headquarters, ceo } = req.body as TechCompany;

    const query: string = `
      INSERT INTO tech_company ( name, foundedYear, employeesNumber, headquarters, ceo )
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [ name, foundedYear, employeesNumber, headquarters, ceo ];

    const result = await sqlQuery(query, params);

    if (result) {
      return res.status(201).json({});
    } else {
      return res.status(500).json({ error: "Language not created" });
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE
companyRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await sqlQuery(`
      DELETE FROM tech_company
      WHERE id = ${id}
    `);

    res.json({ message: "Language deleted!" });
  } catch (error) {
    next(error);
  }
});

// CRUD: UPDATE
companyRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const {  name, foundedYear, employeesNumber, headquarters, ceo  } = req.body as TechCompany;

    const query = `
      UPDATE tech_company
      SET name = ?, foundedYear = ?, employeesNumber = ?, headquarters = ?, ceo = ?
      WHERE id = ?
    `;
    const params = [ name, foundedYear, employeesNumber, headquarters, ceo, id];
    await sqlQuery(query, params);

    const rows = await sqlQuery(`
      SELECT *
      FROM tech_company
      WHERE id=${id}
    `);

    if (rows?.[0]) {
      const response = { data: rows?.[0] };
      res.json(response);
    } else {
      res.status(404).json({ error: "Languange not found" });
    }
  } catch (error) {
    next(error);
  }
});