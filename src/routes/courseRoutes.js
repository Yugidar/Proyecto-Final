const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authenticate');
const db = require('../config/db');

router.get('/paginated', authenticate(''), courseController.getPaginatedCourses);
router.post('/', authenticate('admin'), courseController.createCourse);
router.delete('/:id', authenticate('admin'), courseController.deleteCourse);
router.put('/:id', authenticate('admin'), courseController.updateCourse);

router.get('/load-more', authenticate(), courseController.loadMoreCourses);

router.get('/user-courses', authenticate(), courseController.getUserCourses);
router.delete('/user-courses/:id_user_course', authenticate(), async (req, res) => {
    try {
        const userId = req.user.id_user;
        const { id_user_course } = req.params;

        const [result] = await db.promise().query(
            'DELETE FROM user_courses WHERE id_user_course = ? AND id_user = ?',
            [id_user_course, userId] 
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

router.get('/all', authenticate(), async (req, res) => {
    try {
        const [courses] = await db.promise().query(
            'SELECT id_course, title, description, category, image_url FROM course'
        );
        res.status(200).json({ courses });
    } catch (error) {
        console.error("Error al obtener todos los cursos:", error);
        res.status(500).json({ error: "Error al obtener los cursos", details: error.message });
    }
});


router.post('/enroll/:id', authenticate(), courseController.enrollInCourse);

router.get('/test', (req, res) => {
    res.send("Ruta /courses/test funciona correctamente");
});


module.exports = router;
