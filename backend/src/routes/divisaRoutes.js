const express = require('express');
const router = express.Router();
const divisaController = require('../controllers/divisaController');

router.get('/', divisaController.obtenerDivisas);
router.post('/', divisaController.crearDivisa);
router.put('/:id', divisaController.actualizarDivisa);
router.delete('/:id', divisaController.eliminarDivisa);
router.post('/convertir', divisaController.convertirDivisas);

module.exports = router;