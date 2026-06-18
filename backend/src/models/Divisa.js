const mongoose = require('mongoose');

const DivisaSchema = new mongoose.Schema({
  codigo: { 
    type: String, 
    required: [true, 'El código es obligatorio'], 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  nombre: { 
    type: String, 
    required: [true, 'El nombre es obligatorio'] 
  },
  tasaRespectoAlDolar: { 
    type: Number, 
    required: [true, 'La tasa de cambio es obligatoria'],
    min: [0.00000001, 'La tasa debe ser mayor a cero']
  }
});

module.exports = mongoose.model('Divisa', DivisaSchema);