import { Router } from 'express';
import { pool } from '../../dbSQL.js';

const router = Router();

// cart operations

router.post('/addToCart', async (req, res) => {
  const { userId, goodId, quantity } = req.body;

  try {
    const selectedGood = await pool.query(
      'SELECT stock_quantity from assortment_goods WHERE id = $1',
      [goodId],
    );

    if (selectedGood.rows[0].stock_quantity < quantity)
      return res.status(400).json({
        status: 400,
        message: 'Not enough goods in stock',
      });

    const data = await pool.query(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [userId, goodId, quantity],
    );

    res.status(201).json({
      status: 201,
      message: 'Successfully added to cart',
      data: data.rows[0],
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
});

router.get('/getCartContents', async (req, res) => {
  const { userId } = req.query;
  try {
    const data = await pool.query(
      'SELECT  ag.*, ci.quantity, ci.id AS cart_item_id, ci.user_id, ci.added_at FROM cart_items ci JOIN  assortment_goods ag ON  ci.product_id = ag.id WHERE ci.user_id = $1;',
      [userId],
    );

    res.json({
      status: 200,
      message: 'Successfully found products for order',
      data: data.rows,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
});

export default router;
