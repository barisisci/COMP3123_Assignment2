const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  searchEmployees
} = require('../controllers/employeeController');
const {
  validateEmployee,
  validateEmployeeUpdate,
  validateEmployeeId,
  validateEmployeeQuery
} = require('../middleware/validation');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/v1/emp/employees - Get all employees
router.get('/employees', auth, getAllEmployees);

// GET /api/v1/emp/employees/search - Search employees by department or position
router.get('/employees/search', auth, searchEmployees);

// POST /api/v1/emp/employees - Create new employee (with optional file upload)
router.post('/employees', auth, upload.single('profile_picture'), validateEmployee, createEmployee);

// GET /api/v1/emp/employees/{eid} - Get employee by ID
router.get('/employees/:eid', auth, validateEmployeeId, getEmployeeById);

// PUT /api/v1/emp/employees/{eid} - Update employee (with optional file upload)
router.put('/employees/:eid', auth, upload.single('profile_picture'), validateEmployeeId, validateEmployeeUpdate, updateEmployee);

// DELETE /api/v1/emp/employees?eid=xxx - Delete employee
router.delete('/employees', auth, validateEmployeeQuery, deleteEmployee);

module.exports = router;
