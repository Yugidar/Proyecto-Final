/* const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

const testUser = {
    username: 'testuser',
    password: 'TestPass123',
    role: 'admin',
};

let token;
let normalUserToken;
let courseId;
let userCourseId;

beforeAll(async () => {
    await db.promise().query('DELETE FROM user_courses');
    await db.promise().query('DELETE FROM user WHERE username IN (?, ?)', [testUser.username, 'user1']);
    await db.promise().query('DELETE FROM course WHERE title IN (?, ?)', ['Curso de Node.js', 'Curso de Vue.js']);

    await request(app).post('/auth/register').send(testUser);
    const loginRes = await request(app).post('/auth/login').send({
        username: testUser.username,
        password: testUser.password,
    });
    token = loginRes.body.token;

    await request(app).post('/auth/register').send({
        username: 'user1',
        password: 'UserPass123',
        role: 'normal',
    });
    const normalLoginRes = await request(app).post('/auth/login').send({
        username: 'user1',
        password: 'UserPass123',
    });
    normalUserToken = normalLoginRes.body.token;

    const courseRes = await request(app)
        .post('/courses')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Curso de Node.js',
            description: 'Aprende Node.js desde cero',
            category: 'Desarrollo Web',
            image_url: 'https://example.com/nodejs.png',
        });

    courseId = courseRes.body.courseId;
});

describe('✅ Pruebas de aceptación del usuario', () => {
    test('Un usuario normal debe poder inscribirse en un curso', async () => {
        const res = await request(app)
            .post(`/courses/enroll/${courseId}`)
            .set('Authorization', `Bearer ${normalUserToken}`);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Inscripción exitosa');

        const [checkEnrollment] = await db.promise().query(
            'SELECT id_user_course FROM user_courses WHERE id_course = ?',
            [courseId]
        );
        expect(checkEnrollment.length).toBeGreaterThan(0);

        userCourseId = checkEnrollment[0].id_user_course;
    });

    test('Debe permitir a un usuario salir de un curso', async () => {
        const res = await request(app)
            .delete(`/courses/user-courses/${userCourseId}`)
            .set('Authorization', `Bearer ${normalUserToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Has salido del curso correctamente');

        const [checkEnrollment] = await db.promise().query(
            'SELECT * FROM user_courses WHERE id_user_course = ?',
            [userCourseId]
        );
        expect(checkEnrollment.length).toBe(0);
    });

    test('Debe rechazar eliminación de cursos por un usuario normal', async () => {
        const res = await request(app)
            .delete(`/courses/${courseId}`)
            .set('Authorization', `Bearer ${normalUserToken}`);

        expect(res.status).toBe(403);
    });
});

describe('🔒 Autenticación de usuarios', () => {
    test('Debe permitir iniciar sesión con credenciales correctas', async () => {
        const res = await request(app).post('/auth/login').send({
            username: testUser.username,
            password: testUser.password,
        });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('Debe rechazar credenciales incorrectas', async () => {
        const res = await request(app).post('/auth/login').send({
            username: testUser.username,
            password: 'wrongpassword',
        });
        expect(res.status).toBe(400);
    });
});

describe('🛡️ Gestión de permisos según rol', () => {
    test('Debe permitir acceso a admin para crear cursos', async () => {
        const res = await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Curso de Vue.js',
                description: 'Aprende Vue.js',
                category: 'Frontend',
                image_url: 'https://example.com/vue.png',
            });
        expect(res.status).toBe(201);
    });

    test('Debe rechazar acceso a usuarios normales para crear cursos', async () => {
        const res = await request(app)
            .post('/courses')
            .set('Authorization', `Bearer ${normalUserToken}`)
            .send({
                title: 'Curso de React.js',
                description: 'Aprende React.js',
                category: 'Frontend',
                image_url: 'https://example.com/react.png',
            });
        expect(res.status).toBe(403);
    });
});

describe('🔑 Pruebas de seguridad en tokens JWT', () => {
    test('Debe rechazar acceso sin token', async () => {
        const res = await request(app).get('/courses/paginated');
        expect(res.status).toBe(401);
    });

    test('Debe rechazar token inválido', async () => {
        const res = await request(app)
            .get('/courses/paginated')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.status).toBe(498);
    });

    test('Debe aceptar un token válido', async () => {
        const res = await request(app)
            .get('/courses/paginated')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test('Debe manejar la expiración del token correctamente', async () => {
        const expiredToken = require('jsonwebtoken').sign(
            { id_user: 1, role: 'admin', exp: Math.floor(Date.now() / 1000) - 10 },
            process.env.JWT_SECRET
        );

        const res = await request(app)
            .get('/courses/paginated')
            .set('Authorization', `Bearer ${expiredToken}`);

        expect(res.status).toBe(440);
        expect(res.body.error).toBe('Sesión expirada, inicia sesión nuevamente');
    });
});

describe('📊 Pruebas de usabilidad', () => {
    test('Debe cargar los cursos correctamente con paginación', async () => {
        const res = await request(app)
            .get('/courses/paginated?page=1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.courses).toBeDefined();
    });

    test('Debe permitir buscar cursos con filtros', async () => {
        const res = await request(app)
            .get('/courses/load-more?lastCourseId=0&limit=5')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.courses)).toBe(true);
    });
});

afterAll(async () => {
    await db.promise().query('DELETE FROM user_courses');
    await db.promise().query('DELETE FROM user WHERE username IN (?, ?)', [testUser.username, 'user1']);
    await db.promise().query('DELETE FROM course WHERE title IN (?, ?)', ['Curso de Node.js', 'Curso de Vue.js']);
    db.end();
});

beforeAll(() => {
    // En tests no iniciamos el servidor, pero lo podemos simular
    server = app.listen();  // Aquí solo escuchamos para poder hacer las pruebas
});

afterAll((done) => {
    server.close(done);  // Cierra el servidor después de las pruebas
}); */