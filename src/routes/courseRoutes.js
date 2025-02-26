const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authenticate');
const db = require('../config/db'); // Asegúrate de que la ruta sea correcta

router.get('/paginated', authenticate(''), courseController.getPaginatedCourses);
router.post('/', authenticate('admin'), courseController.createCourse);
router.delete('/:id', authenticate('admin'), courseController.deleteCourse);
router.put('/:id', authenticate('admin'), courseController.updateCourse);

router.get('/user-courses', authenticate(), courseController.getUserCourses); // Obtener cursos del usuario autenticado
router.delete('/user-courses/:id_user_course', authenticate(), async (req, res) => {
    try {
        const userId = req.user.id_user;
        const { id_user_course } = req.params; // ✅ Corregido para usar id_user_course

        const [result] = await db.promise().query(
            'DELETE FROM user_courses WHERE id_user_course = ? AND id_user = ?',
            [id_user_course, userId] // ✅ Asegurar que los valores sean correctos
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No estás inscrito en este curso" });
        }

        res.status(200).json({ message: "Has salido del curso correctamente" });

    } catch (error) {
        console.error("Error al salir del curso:", error);
        res.status(500).json({ error: "Error al salir del curso", details: error.message });
    }
});

// 🔹 Nueva ruta para inscribirse en un curso
router.post('/enroll/:id', authenticate(), courseController.enrollInCourse);

// Verifica que esta ruta está en la consola
router.get('/test', (req, res) => {
    res.send("Ruta /courses/test funciona correctamente");
});


module.exports = router;
