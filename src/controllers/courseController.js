const db = require('../config/db');

exports.getPaginatedCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4; // Cursos por página
        const offset = (page - 1) * limit;

        const [courses] = await db.promise().query(
            'SELECT id_course, title, description, category, image_url FROM course LIMIT ? OFFSET ?',
            [limit, offset]
        );

        const [total] = await db.promise().query('SELECT COUNT(*) AS total FROM course');
        const totalPages = Math.ceil(total[0].total / limit);

        res.status(200).json({
            courses,
            totalPages,
            currentPage: page
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los cursos', details: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el curso existe
        const [course] = await db.promise().query('SELECT * FROM course WHERE id_course = ?', [id]);
        if (course.length === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        // Eliminar el curso
        await db.promise().query('DELETE FROM course WHERE id_course = ?', [id]);

        res.status(200).json({ message: 'Curso eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el curso', details: error.message });
    }
};
