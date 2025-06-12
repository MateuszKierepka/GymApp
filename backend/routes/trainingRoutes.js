const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', trainingController.getTrainings);
router.get('/:id', trainingController.getTraining);
router.post('/', trainingController.createTraining);
router.post('/generate', trainingController.generateTraining);
router.put('/:id', trainingController.updateTraining);
router.delete('/:id', trainingController.deleteTraining);

module.exports = router; 