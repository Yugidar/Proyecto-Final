const db = require('../config/db');

// Obtener todos los cursos (Solo admin)
exports.getCourses = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden ver los cursos' });
        }

        const [courses] = await db.promise().query(`
            SELECT c.id_course, c.title, c.description, c.category, u.username 
            FROM course c 
            JOIN user u ON c.id_user = u.id_user
        `);
        
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los cursos', details: err.message });
    }
};

// Eliminar un curso
exports.deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.promise().query('DELETE FROM course WHERE id_course = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        res.status(200).json({ message: 'Curso eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el curso', details: err.message });
    }
};
