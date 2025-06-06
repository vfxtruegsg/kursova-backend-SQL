import { Router } from 'express';
import { pool } from '../../dbSQL.js';
import { randomBytes } from 'crypto';

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

    await pool.query(
      'UPDATE assortment_goods SET stock_quantity = stock_quantity - $1 WHERE id = $2',
      [quantity, goodId],
    );

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

router.post('/cleanCart', async (req, res) => {
  const { userId } = req.body;
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    res.status(204).send();
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
});

// orders

router.post('/placeOrder', async (req, res) => {
  const { totalAmount, shippingAddress, customerId, orderedCart, quantity } =
    req.body;

  const randomNumber = () => Math.trunc(Math.random() * 10);
  const genrateTrackingNum = (str) => str.replace(/X/g, randomNumber);

  try {
    const data = await pool.query(
      'INSERT INTO orders (total_amount, shipping_address, status, tracking_number, customer_id, fk_ordered_cart, quantity) 	VALUES ($1, $2, $3,  $4, $5, $6, $7) RETURNING *',
      [
        totalAmount,
        shippingAddress,
        'in progress',
        genrateTrackingNum('UB5775XXXXXHK'),
        customerId,
        orderedCart,
        quantity,
      ],
    );

    res.json({
      status: 201,
      message: 'Successfully created your order',
      data: data.rows[0],
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
});

router.post('/removeFromCart', async (req, res) => {
  const { id, quantity } = req.body;

  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);

    await pool.query(
      'UPDATE assortment_goods SET stock_quantity = stock_quantity + $1 WHERE id = $2',
      [quantity, id],
    );

    res.status(204).send();
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
});

export default router;
