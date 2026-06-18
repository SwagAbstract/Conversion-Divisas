const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const divisaRoutes = require('./src/routes/divisaRoutes');
const divisaRoutes = require('./routes/divisaRoutes'); // Corregido el path relativo
const { conectarBD } = require('./config/db'); // Importa la función de conexión

dotenv.config();

const app = express();

// Middlewares (Buenas prácticas de seguridad y comunicación)
app.use(cors());
app.use(express.json());

// Conexión a la Base de Datos
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado exitosamente a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión a la BD:', err));

// Rutas de la API
// Conexión a la Base de Datos y Rutas de la API
conectarBD(); // Llama a la función de conexión centralizada
app.use('/api/divisas', divisaRoutes);

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});