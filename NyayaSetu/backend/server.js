require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const evidenceRouter = require('./routers/evidenceRouter');
const authRouter = require('./routers/authRouter');
const dashboardRouter = require('./routers/dashboardRouter');
const userRouter = require('./routers/userRouter');
const pinataRouter = require('./routers/pinataRouter');
const integrityRouter = require('./routers/integrityRouter');
const casesRouter = require('./routers/casesRouter');
const errorHandler = require('./middleware/errorMiddleware');
const imagingLogRouter = require('./routers/imagingLogRouter');
const analysisRouter = require('./routers/analysisRouter');
const reportRoutes = require("./routers/reportRoutes");
const app = express();
const transferRouter = require('./routers/transferRouter');
const axios = require('axios'); 

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/auth', authRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api', dashboardRouter);
app.use('/api/users', userRouter);
app.use('/api/pinata', pinataRouter);
app.use('/api', casesRouter);
app.use('/api/integrity', integrityRouter);
app.use('/api/imaging-log', imagingLogRouter);
app.use('/api/analysis', analysisRouter);
app.use("/api", reportRoutes);
app.use('/api/transfers', transferRouter);

app.post('/generate-summary', async (req, res) => {
  const caseReport = req.body.report;

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt: `Summarize the following case report:\n\n${caseReport}`
    }, {
      responseType: 'stream'
    });

    let summary = '';
    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) summary += parsed.response;
        } catch (err) {
          // Ignore lines that are not valid JSON
        }
      }
    });

    response.data.on('end', () => {
      res.json({ summary });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET is missing in .env file');
    process.exit(1);
}

mongoose
    .connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.get('/', (req, res) => {
    res.send('Evidence Chain of Custody API is running...');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});