const express = require('express');
const app = express();
const transferRoutes = require('./Routes/transfer');

app.use(express.json());
app.use('/api', transferRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
