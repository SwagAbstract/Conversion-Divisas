const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const divisaRoutes = require('./routes/divisaRoutes');

dotenv.config();

const app = express();

// Middlewares (Buenas prácticas de seguridad y comunicación)
app.use(cors());
app.use(express.json());

// Conexión a la Base de Datos
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔥 Conectado exitosamente a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión a la BD:', err));

// Rutas de la API
app.use('/api/divisas', divisaRoutes);

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});