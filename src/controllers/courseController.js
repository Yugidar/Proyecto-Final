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
