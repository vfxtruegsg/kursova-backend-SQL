import { Router } from 'express';
import { pool } from '../../dbSQL.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../../constants/index.js';

const router = Router();

// user register

router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT 1 FROM users WHERE email = $1 LIMIT 1',
      [email],
    );

    if (rows.length > 0) {
      throw res
        .status(409)
        .json({ status: 409, message: 'Error, email in use. Please login!' });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const data = await pool.query(
      'INSERT INTO public.users(first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, email, encryptedPassword],
    );

    res.json({
      status: 201,
      message: 'Successfully register a user',
      data: data.rows[0],
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

// user login

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userData = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      [email],
    );

    if (userData.rows[0] == 0) {
      throw res.status(409).json({
        status: 409,
        message: 'Error, user with this email not exist',
      });
    }

    const isEqual = await bcrypt.compare(password, userData.rows[0].password);

    if (!isEqual) {
      throw res.status(401).json({ status: 401, message: 'Unauthorized!' });
    }

    await pool.query('DELETE from sessions WHERE user_id = $1', [
      userData.rows[0].id,
    ]);

    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');
    const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
    const refreshTokenValidUntil = new Date(Date.now() + THIRTY_DAYS);

    const data = await pool.query(
      'INSERT INTO public.sessions(user_id, access_token, refresh_token, access_token_valid_until, refresh_token_valid_until) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        userData.rows[0].id,
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
      ],
    );

    res.cookie('refreshToken', data.rows[0].refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + THIRTY_DAYS),
    });
    res.cookie('sessionId', data.rows[0].id, {
      httpOnly: true,
      expires: new Date(Date.now() + THIRTY_DAYS),
    });

    res.json({
      status: 201,
      message: 'Successfully login a user',
      data: {
        accessToken: data.rows[0].access_token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

export default router;
