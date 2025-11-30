const Employee = require('../models/Employee');
const fs = require('fs');
const path = require('path');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({}).sort({ created_at: -1 });
    
    const formattedEmployees = employees.map(emp => ({
      employee_id: emp._id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      position: emp.position,
      salary: emp.salary,
      date_of_joining: emp.date_of_joining,
      department: emp.department,
      profile_picture: emp.profile_picture ? `/uploads/${path.basename(emp.profile_picture)}` : null
    }));

    res.status(200).json(formattedEmployees);
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      position,
      salary,
      date_of_joining,
      department
    } = req.body;

    // Check if employee with email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      // Delete uploaded file if exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        status: false,
        message: 'Employee with this email already exists'
      });
    }

    const employeeData = {
      first_name,
      last_name,
      email,
      position,
      salary,
      date_of_joining,
      department
    };

    // Add profile picture if uploaded
    if (req.file) {
      employeeData.profile_picture = req.file.path;
    }

    const employee = new Employee(employeeData);
    await employee.save();

    res.status(201).json({
      message: 'Employee created successfully.',
      employee_id: employee._id
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create employee error:', error);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { eid } = req.params;
    
    const employee = await Employee.findById(eid);
    if (!employee) {
      return res.status(404).json({
        status: false,
        message: 'Employee not found'
      });
    }

    const formattedEmployee = {
      employee_id: employee._id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      position: employee.position,
      salary: employee.salary,
      date_of_joining: employee.date_of_joining,
      department: employee.department,
      profile_picture: employee.profile_picture ? `/uploads/${path.basename(employee.profile_picture)}` : null
    };

    res.status(200).json(formattedEmployee);
  } catch (error) {
    console.error('Get employee by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: false,
        message: 'Invalid employee ID format'
      });
    }
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { eid } = req.params;
    const updateData = { ...req.body };

    // Check if employee exists
    const existingEmployee = await Employee.findById(eid);
    if (!existingEmployee) {
      // Delete uploaded file if exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        status: false,
        message: 'Employee not found'
      });
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== existingEmployee.email) {
      const emailExists = await Employee.findOne({ 
        email: updateData.email, 
        _id: { $ne: eid } 
      });
      if (emailExists) {
        // Delete uploaded file if exists
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          status: false,
          message: 'Employee with this email already exists'
        });
      }
    }

    // Handle file upload - delete old file if new one is uploaded
    if (req.file) {
      // Delete old profile picture if exists
      if (existingEmployee.profile_picture) {
        const oldFilePath = path.join(__dirname, '..', existingEmployee.profile_picture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.profile_picture = req.file.path;
    }

    await Employee.findByIdAndUpdate(
      eid,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Employee details updated successfully.'
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update employee error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: false,
        message: 'Invalid employee ID format'
      });
    }
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { eid } = req.query;
    
    if (!eid) {
      return res.status(400).json({
        status: false,
        message: 'Employee ID is required'
      });
    }

    const employee = await Employee.findById(eid);
    if (!employee) {
      return res.status(404).json({
        status: false,
        message: 'Employee not found'
      });
    }

    // Delete profile picture file if exists
    if (employee.profile_picture) {
      const filePath = path.join(__dirname, '..', employee.profile_picture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Employee.findByIdAndDelete(eid);

    res.status(204).json({
      message: 'Employee deleted successfully.'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: false,
        message: 'Invalid employee ID format'
      });
    }
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

// Search employees by department or position
const searchEmployees = async (req, res) => {
  try {
    const { department, position } = req.query;
    const query = {};

    // Build search query
    if (department) {
      query.department = { $regex: department, $options: 'i' }; // Case-insensitive search
    }
    if (position) {
      query.position = { $regex: position, $options: 'i' }; // Case-insensitive search
    }

    // If no search parameters provided, return all employees
    const employees = await Employee.find(Object.keys(query).length > 0 ? query : {})
      .sort({ created_at: -1 });

    const formattedEmployees = employees.map(emp => ({
      employee_id: emp._id,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      position: emp.position,
      salary: emp.salary,
      date_of_joining: emp.date_of_joining,
      department: emp.department,
      profile_picture: emp.profile_picture ? `/uploads/${path.basename(emp.profile_picture)}` : null
    }));

    res.status(200).json(formattedEmployees);
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  searchEmployees
};
