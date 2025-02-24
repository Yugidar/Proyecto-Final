const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, courseController.getCourses);
router.delete('/:id', authenticate, courseController.deleteCourse);

module.exports = router;
