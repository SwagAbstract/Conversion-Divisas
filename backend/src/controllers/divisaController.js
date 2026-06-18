const Divisa = require('../models/Divisa');

// 1. OBTENER TODAS LAS DIVISAS (Read)
exports.obtenerDivisas = async (req, res) => {
  try {
    const divisas = await Divisa.find();
    res.json(divisas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las divisas', error: error.message });
  }
};

// 2. CREAR NUEVA DIVISA (Create)
exports.crearDivisa = async (req, res) => {
  try {
    const nuevaDivisa = new Divisa(req.body);
    await nuevaDivisa.save();
    res.status(201).json(nuevaDivisa);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear la divisa', error: error.message });
  }
};

// 3. ACTUALIZAR TASA DE CAMBIO (Update)
exports.actualizarDivisa = async (req, res) => {
  try {
    const divisaActualizada = await Divisa.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!divisaActualizada) return res.status(404).json({ mensaje: 'Divisa no encontrada' });
    res.json(divisaActualizada);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar', error: error.message });
  }
};

// 4. ELIMINAR DIVISA (Delete)
exports.eliminarDivisa = async (req, res) => {
  try {
    const divisaEliminada = await Divisa.findByIdAndDelete(req.params.id);
    if (!divisaEliminada) return res.status(404).json({ mensaje: 'Divisa no encontrada' });
    res.json({ mensaje: 'Divisa eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar', error: error.message });
  }
};

// 5. LÓGICA DE CONVERSIÓN
exports.convertirDivisas = async (req, res) => {
  try {
    const { cantidad, monedaOrigen, monedasDestino } = req.body;

    // Validaciones básicas
    if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser un número positivo de doble precisión.' });
    }

    // Buscar la moneda de origen en la BD
    const divisaOrigen = await Divisa.findOne({ codigo: monedaOrigen });
    if (!divisaOrigen) return res.status(404).json({ mensaje: `Moneda de origen ${monedaOrigen} no soportada.` });

    if (divisaOrigen.tasaRespectoAlDolar <= 0) {
      return res.status(400).json({ mensaje: 'La tasa de la moneda de origen no es válida para conversión.' });
    }

    // Buscar las monedas de destino en la BD
    const divisasDestinoBD = await Divisa.find({ codigo: { $in: monedasDestino } });

    // Convertir la cantidad a "Dólares Base" primero, y luego a la moneda destino
    const cantidadEnDolares = cantidad / divisaOrigen.tasaRespectoAlDolar;

    const resultados = divisasDestinoBD.map(divisa => {
      const valorConvertido = cantidadEnDolares * divisa.tasaRespectoAlDolar;
      return {
        codigo: divisa.codigo,
        nombre: divisa.nombre,
        valorConvertido: Number(valorConvertido.toFixed(4)) // Doble precisión formateada a 4 decimales
      };
    });

    res.json({
      cantidadOriginal: cantidad,
      monedaOrigen,
      conversiones: resultados
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el cálculo', error: error.message });
  }
};