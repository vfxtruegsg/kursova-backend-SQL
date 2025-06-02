import authRouter from './users/user.js';
import ordersRouter from './orders/orders.js';
import goods from './assortmentGoods/assortmentGoods.js';
import { Router } from 'express';

const router = Router();

router.use('/auth', authRouter);
router.use('/orders', ordersRouter);
router.use('/goods', goods);

export default router;
