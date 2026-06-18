const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const divisaRoutes = require('./routes/divisaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado exitosamente a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión a la BD:', err));

app.use('/api/divisas', divisaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});