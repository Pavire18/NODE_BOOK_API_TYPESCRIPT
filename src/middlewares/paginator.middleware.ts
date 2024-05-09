import { type Request, type NextFunction, type Response } from "express";

interface CustomRequest extends Request {
  page?: number;
  limit?: number;
}

export const paginator = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log("Estamos en el middleware /car que comprueba parámetros");

    // Accede a req.query como de costumbre
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      req.page = page;
      req.limit = limit;
      next();
    } else {
      console.log("Parámetros no válidos:");
      console.log(JSON.stringify(req.query));
      res.status(400).json({ error: "Params page or limit are not valid" });
    }
  } catch (error) {
    res.status(404).json(error);
  }
};
  
  module.exports = { paginator };