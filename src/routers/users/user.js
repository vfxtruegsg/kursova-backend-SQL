import { Router } from 'express';
import { pool } from '../../dbSQL.js';
import bcrypt from 'bcrypt';
import { createSession, setupSession } from '../../utils/sessionsSettings.js';

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
      'SELECT id, first_name, last_name, email, password FROM users WHERE email = $1',
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

    const {
      accessToken,
      refreshToken,
      accessTokenValidUntil,
      refreshTokenValidUntil,
    } = createSession();

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

    setupSession(res, {
      id: data.rows[0].id,
      refreshToken: data.rows[0].refresh_token,
    });

    res.json({
      status: 201,
      message: 'Successfully login a user',
      data: {
        accessToken: data.rows[0].access_token,
        ...userData.rows[0],
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

// logout user

router.post('/logout', async (req, res) => {
  try {
    if (req.cookies.sessionId) {
      await pool.query('delete from sessions where id = $1', [
        req.cookies.sessionId,
      ]);
    }

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

// refresh user session

router.post('/refresh', async (req, res) => {
  try {
    const session = await pool.query('SELECT * from sessions where id = $1', [
      req.cookies.sessionId,
    ]);

    if (session.rows[0] == 0) {
      throw res.status(401).json({
        status: 401,
        message: 'Session not found',
      });
    }

    const isSessionTokenExpired =
      new Date() > new Date(session.rows[0].refreshTokenValidUntil);

    if (isSessionTokenExpired) {
      throw res.status(401).json({
        status: 401,
        message: 'Session token expired',
      });
    }

    await pool.query('DELETE from sessions WHERE user_id = $1', [
      session.rows[0].user_id,
    ]);

    const {
      accessToken,
      refreshToken,
      accessTokenValidUntil,
      refreshTokenValidUntil,
    } = createSession();

    const data = await pool.query(
      'INSERT INTO public.sessions(user_id, access_token, refresh_token, access_token_valid_until, refresh_token_valid_until) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        session.rows[0].user_id,
        accessToken,
        refreshToken,
        accessTokenValidUntil,
        refreshTokenValidUntil,
      ],
    );

    setupSession(res, data.rows[0]);

    res.json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: {
        accessToken: data.rows[0].access_token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

export default router;
