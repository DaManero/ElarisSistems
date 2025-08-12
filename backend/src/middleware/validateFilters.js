const { query } = require("express-validator");

const validateFilters = [
  query("period")
    .optional()
    .isIn(["today", "yesterday", "week", "month", "quarter", "year", "custom"])
    .withMessage("Período inválido"),

  query("date_from")
    .optional()
    .isISO8601()
    .withMessage("Fecha de inicio inválida"),

  query("date_to").optional().isISO8601().withMessage("Fecha de fin inválida"),

  query("group_by")
    .optional()
    .isIn(["day", "week", "month", "quarter", "year"])
    .withMessage("Agrupación inválida"),

  query("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID de categoría inválido"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Límite debe ser entre 1 y 100"),
];

module.exports = { validateFilters };
