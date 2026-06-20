import { Errors } from "../errors/error-definitions.js";

export function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = req[source];
    const result = schema.safeParse(data);
    if (!result.success) {
      const formatted = result.error.flatten().fieldErrors;
      return next(Errors.Validation(formatted));
    }
    req[source] = result.data;
    next();
  };
}
