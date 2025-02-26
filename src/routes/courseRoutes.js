const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authenticate');

router.get('/paginated', authenticate('admin'), courseController.getPaginatedCourses);
router.post('/', authenticate('admin'), courseController.createCourse);
router.delete('/:id', authenticate('admin'), courseController.deleteCourse);
router.put('/:id', authenticate('admin'), courseController.updateCourse);

router.get('/user-courses', authenticate(), courseController.getUserCourses); // Obtener cursos del usuario autenticado
router.delete('/user-courses/:id_course', authenticate(), courseController.leaveCourse); // Salir de un curso

// Verifica que esta ruta está en la consola
router.get('/test', (req, res) => {
    res.send("Ruta /courses/test funciona correctamente");
});

module.exports = router;
