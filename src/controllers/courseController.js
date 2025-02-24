const db = require('../config/db');

// Obtener cursos paginados
exports.getCourses = async (req, res) => {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 4;
    const offset = (page - 1) * limit;

    try {
        const [courses] = await db.promise().query(
            'SELECT id_course, title, description, category FROM course LIMIT ? OFFSET ?', 
            [limit, offset]
        );

        const [[{ total }]] = await db.promise().query('SELECT COUNT(*) as total FROM course');

        res.status(200).json({
            courses,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los cursos' });
    }
};

// Crear un nuevo curso
exports.createCourse = async (req, res) => {
    const { title, description, category, id_user } = req.body;

    if (!title || !description || !category || !id_user) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        await db.promise().query(
            'INSERT INTO course (title, description, category, id_user) VALUES (?, ?, ?, ?)', 
            [title, description, category, id_user]
        );
        res.status(201).json({ message: 'Curso creado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear el curso' });
    }
};

// Actualizar un curso
exports.updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, description, category } = req.body;

    try {
        const [result] = await db.promise().query(
            'UPDATE course SET title = ?, description = ?, category = ? WHERE id_course = ?', 
            [title, description, category, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        res.status(200).json({ message: 'Curso actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el curso' });
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

        res.status(200).json({ message: 'Curso eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el curso' });
    }
};
