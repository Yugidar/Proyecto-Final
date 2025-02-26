const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authenticate');

router.get('/paginated', authenticate('admin'), courseController.getPaginatedCourses);
router.post('/', authenticate('admin'), courseController.createCourse);
router.delete('/:id', authenticate('admin'), courseController.deleteCourse);

// Verifica que esta ruta está en la consola
router.get('/test', (req, res) => {
    res.send("Ruta /courses/test funciona correctamente");
});

module.exports = router;
