import usersRouter from './users/user.js';
import ordersRouter from './orders/orders.js';
import goods from './assortmentGoods/assortmentGoods.js';
import { Router } from 'express';

const router = Router();

router.use('/users', usersRouter);
router.use('/orders', ordersRouter);
router.use('/goods', goods);

export default router;
