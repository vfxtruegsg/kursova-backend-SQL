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

// current user information

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await pool.query('SELECT * FROM public.users WHERE id = $1', [
      userId,
    ]);
    res.json({
      status: 200,
      message: 'Successfully completed operation',
      data: data.rows,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

// delete user

router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ status: 400, message: 'userId is required' });
    }

    const data = await pool.query(
      'DELETE FROM public.users WHERE id = $1 RETURNING *',
      [userId],
    );

    res.json({
      status: 200,
      message: 'Succsessfulle deleted a user',
      data: data.rows[0],
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

export default router;
