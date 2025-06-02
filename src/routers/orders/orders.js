import { Router } from 'express';
import { pool } from '../../dbSQL.js';

const router = Router();

// cart operations

router.post('/addToCart', async (req, res) => {
  const { userId, goodId, quantity } = req.body;

  try {
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

export default router;
