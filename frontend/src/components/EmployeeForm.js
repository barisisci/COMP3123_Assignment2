import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
} from '@mui/material';
import { employeeAPI } from '../services/api';

const EmployeeForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    salary: '',
    date_of_joining: '',
    department: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await employeeAPI.getById(id);
      const employee = response.data;
      setFormData({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        position: employee.position,
        salary: employee.salary,
        date_of_joining: employee.date_of_joining.split('T')[0],
        department: employee.department,
      });
      if (employee.profile_picture) {
        setPreview(`http://localhost:3000${employee.profile_picture}`);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      setError('Failed to load employee data');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        salary: parseFloat(formData.salary),
        date_of_joining: new Date(formData.date_of_joining).toISOString(),
      };

      if (isEdit) {
        await employeeAPI.update(id, data, profilePicture);
      } else {
        await employeeAPI.create(data, profilePicture);
      }

      navigate('/employees');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            {isEdit ? 'Edit Employee' : 'Add New Employee'}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                src={preview}
                sx={{ width: 120, height: 120 }}
              >
                {!preview && 'No Image'}
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Button variant="outlined" component="label">
                Upload Profile Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Salary"
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Date of Joining"
              type="date"
              name="date_of_joining"
              value={formData.date_of_joining}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/employees')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmployeeForm;
