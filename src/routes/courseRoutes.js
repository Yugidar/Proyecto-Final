const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authenticate');

router.get('/paginated', authenticate('admin'), courseController.getPaginatedCourses);
router.delete('/:id', authenticate('admin'), courseController.deleteCourse);

module.exports = router;
