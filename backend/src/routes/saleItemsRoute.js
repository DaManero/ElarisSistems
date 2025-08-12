const express = require("express");
const router = express.Router();
const saleItemController = require("../controllers/SaleItemController");

// GET /api/sale-items/best-sellers - Get best selling products
router.get("/best-sellers", saleItemController.getBestSellingProducts);

// GET /api/sale-items/sale/:saleId - Get all items from a specific sale
router.get("/sale/:saleId", saleItemController.getItemsBySale);

// GET /api/sale-items/product/:productId - Get sales history for a product
router.get("/product/:productId", saleItemController.getItemsByProduct);

// GET /api/sale-items/:id - Get specific item details
router.get("/:id", saleItemController.getItem);

// POST /api/sale-items/sale/:saleId - Add new item to existing sale
router.post("/sale/:saleId", saleItemController.addItemToSale);

// PUT /api/sale-items/:id - Update item (quantity, discount, price)
router.put("/:id", saleItemController.updateItem);

// DELETE /api/sale-items/:id - Remove item from sale
router.delete("/:id", saleItemController.deleteItem);

module.exports = router;
