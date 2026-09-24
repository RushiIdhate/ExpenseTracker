import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDatabase } from './config/db';
import authRoutes from './routes/authRoutes';
import allocationRoutes from './routes/allocationRoutes';
import budgetRoutes from './routes/budgetRoutes';
import expenseRoutes from './routes/expenseRoutes';
import { errorHandler, notFound } from './middleware/error';

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors()
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/expenses', expenseRoutes);

app.use(notFound);
app.use(errorHandler);

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
