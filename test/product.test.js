const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

let token;

beforeAll(async () => {
  // String de conexión a MongoDB
  await mongoose.connect('mongodb+srv://admin:1234@test.bnnzmy9.mongodb.net/?retryWrites=true&w=majority&appName=Test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Crear y autenticar un usuario para las pruebas de productos
  await request(app)
    .post('/auth/register')
    .send({
      username: 'admin2',
      password: '2'
    });

  const res = await request(app)
    .post('/auth/login')
    .send({
      username: 'admin2',
      password: '2'
    });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Product Routes', () => {
  it('should create a new product', async () => {
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Product 1',
        description: 'Description for product 1'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Product 1');
  });

  it('should get all products', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should update a product', async () => {
    const newProduct = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Product to Update',
        description: 'Description to update'
      });

    const res = await request(app)
      .put(`/products/${newProduct.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Product',
        description: 'Updated description'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Product');
  });


});
