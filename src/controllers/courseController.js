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
        console.error("❌ Error en getPaginatedCourses:", error);
        res.status(500).json({ error: 'Error al obtener los cursos', details: error.message });
    }
};

exports.loadMoreCourses = async (req, res) => {
    try {
        const lastCourseId = parseInt(req.query.lastCourseId) || 0;
        const limit = parseInt(req.query.limit) || 4;

        let query = `
            SELECT id_course, title, description, category, image_url 
            FROM course 
        `;

        let params = [];

        if (lastCourseId > 0) {
            query += ` WHERE id_course > ? `;
            params.push(lastCourseId);
        }

        query += ` ORDER BY id_course ASC LIMIT ? `;
        params.push(limit);

        const [courses] = await db.promise().query(query, params);

        res.status(200).json({
            courses
        });

    } catch (error) {
        console.error("❌ Error en loadMoreCourses:", error);
        res.status(500).json({ error: "Error al obtener los cursos", details: error.message });
    }
};

exports.getUserCourses = async (req, res) => {
    try {
        const userId = req.user.id_user;

        // 🔹 Obtener todos los cursos inscritos SIN paginación
        const [courses] = await db.promise().query(`
            SELECT uc.id_user_course, c.id_course, c.title, c.description, c.category, c.image_url
            FROM user_courses uc
            JOIN course c ON uc.id_course = c.id_course
            WHERE uc.id_user = ?
        `, [userId]);

        console.log("✅ Cursos inscritos en el backend:", courses);

        res.status(200).json({ courses });

    } catch (error) {
        console.error("❌ Error en getUserCourses:", error);
        res.status(500).json({ error: "Error al obtener los cursos del usuario", details: error.message });
    }
};

exports.enrollInCourse = async (req, res) => {
    try {
        const userId = req.user?.id_user;
        const courseId = req.params.id;

        if (!userId || !courseId) {
            return res.status(400).json({ error: "Faltan datos para la inscripción" });
        }

        // 🔹 Verificar si el usuario ya está inscrito en el curso
        const [existingEnrollment] = await db.promise().query(
            'SELECT * FROM user_courses WHERE id_user = ? AND id_course = ?',
            [userId, courseId]
        );

        if (existingEnrollment.length > 0) {
            return res.status(400).json({ error: "⚠️ Ya estás inscrito en este curso" });
        }

        // 🔹 Inscribir al usuario en el curso
        await db.promise().query(
            'INSERT INTO user_courses (id_user, id_course) VALUES (?, ?)',
            [userId, courseId]
        );

        res.status(201).json({ message: "✅ Inscripción exitosa" });

    } catch (error) {
        console.error("❌ Error en enrollInCourse:", error);
        res.status(500).json({ error: "Error al inscribirse en el curso", details: error.message });
    }
};

// 🔹 Eliminar la inscripción del usuario en un curso
exports.leaveCourse = async (req, res) => {
    try {
        console.log("👤 Usuario autenticado:", req.user); 
        const userId = req.user?.id_user;
        const courseId = req.params.id_course;

        if (!userId || !courseId) {
            return res.status(400).json({ error: "⚠️ Falta el ID del usuario o del curso" });
        }

        const [result] = await db.promise().query(`
            DELETE FROM user_courses WHERE id_user = ? AND id_course = ?
        `, [userId, courseId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "⚠️ No estás inscrito en este curso" });
        }

        res.status(200).json({ message: "✅ Has salido del curso correctamente" });

    } catch (error) {
        console.error("❌ Error en leaveCourse:", error);
        res.status(500).json({ error: "Error al salir del curso", details: error.message });
    }
};

// 🔹 Crear curso (solo admin)
exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, image_url } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const [result] = await db.promise().query(
            'INSERT INTO course (title, description, category, image_url) VALUES (?, ?, ?, ?)',
            [title, description, category, image_url]
        );

        res.status(201).json({ message: '✅ Curso creado correctamente', courseId: result.insertId });

    } catch (error) {
        console.error("❌ Error en createCourse:", error);
        res.status(500).json({ error: 'Error al crear el curso', details: error.message });
    }
};

// 🔹 Actualizar curso (solo admin)
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, description, image_url } = req.body;

        if (!title || !category || !description || !image_url) {
            return res.status(400).json({ error: "⚠️ Todos los campos son obligatorios" });
        }

        const query = `
            UPDATE course 
            SET title = ?, category = ?, description = ?, image_url = ? 
            WHERE id_course = ?
        `;
        const values = [title, category, description, image_url, id];

        const [result] = await db.promise().query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "⚠️ Curso no encontrado" });
        }

        res.json({ message: "✅ Curso actualizado correctamente" });

    } catch (error) {
        console.error("❌ Error en updateCourse:", error);
        res.status(500).json({ error: "Error interno del servidor", details: error.message });
    }
};

// 🔹 Eliminar curso (solo admin)
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el curso existe
        const [course] = await db.promise().query('SELECT * FROM course WHERE id_course = ?', [id]);
        if (course.length === 0) {
            return res.status(404).json({ error: '⚠️ Curso no encontrado' });
        }

        // Eliminar el curso
        await db.promise().query('DELETE FROM course WHERE id_course = ?', [id]);

        res.status(200).json({ message: '✅ Curso eliminado correctamente' });

    } catch (error) {
        console.error("❌ Error en deleteCourse:", error);
        res.status(500).json({ error: 'Error al eliminar el curso', details: error.message });
    }
};
