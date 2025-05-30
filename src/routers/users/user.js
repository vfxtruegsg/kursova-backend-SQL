import { Router } from 'express';
import { pool } from '../../dbSQL.js';

const router = Router();

// users list
router.get('/', async (req, res) => {
  try {
    const data = await pool.query(
      'SELECT id, first_name, last_name, gender, isActive FROM public.users ORDER BY id',
    );

    res.json({
      status: 200,
      message: 'Successfully completed operation',
      data: data.rows,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

export default router;
