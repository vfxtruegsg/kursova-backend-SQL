import { Router } from 'express';
import { pool } from '../../dbSQL.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = await pool.query(
      'SELECT id, name, price, good_picture from assortment_goods',
    );

    res.json({
      status: 200,
      message: 'Successfully completed operation',
      data: data.rows,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await pool.query(
      'select * from assortment_goods where id = $1',
      [id],
    );

    res.json({
      status: 200,
      message: 'Successfully completed operation',
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
