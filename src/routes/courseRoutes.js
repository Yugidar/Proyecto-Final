const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authenticate');

router.get('/paginated', authenticate('admin'), courseController.getPaginatedCourses);

module.exports = router;
