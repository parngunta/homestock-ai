import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { householdRouter } from './routes/household';
import { inventoryRouter } from './routes/inventory';
import { shoppingListRouter } from './routes/shopping-list';
import { notificationRouter } from './routes/notification';
import { aiRouter } from './routes/ai';
import { receiptRouter } from './routes/receipt';
import { barcodeRouter } from './routes/barcode';
import { voiceRouter } from './routes/voice';
import { activityRouter } from './routes/activity';
import { dashboardRouter } from './routes/dashboard';
import { consumptionRouter } from './routes/consumption';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRouter);
app.use('/api/households', authMiddleware, householdRouter);
app.use('/api/inventory', authMiddleware, inventoryRouter);
app.use('/api/shopping-list', authMiddleware, shoppingListRouter);
app.use('/api/notifications', authMiddleware, notificationRouter);
app.use('/api/ai', authMiddleware, aiRouter);
app.use('/api/receipts', authMiddleware, receiptRouter);
app.use('/api/barcode', authMiddleware, barcodeRouter);
app.use('/api/voice', authMiddleware, voiceRouter);
app.use('/api/activity', authMiddleware, activityRouter);
app.use('/api/dashboard', authMiddleware, dashboardRouter);
app.use('/api/consumption', authMiddleware, consumptionRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;