import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Edit2, Trash2, Mail, Briefcase } from 'lucide-react';
import { addEmployee, updateEmployee, deleteEmployee } from '../store/employeeSlice';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import './EmployeesPage.css';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  position: yup.string().required('Position is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  profileImage: yup.string(),
});

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const { employees } = useSelector(state => state.employees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      position: '',
      email: '',
      profileImage: ''
    }
  });

  const profileImg = watch('profileImage');

  const openAddModal = () => {
    setEditingEmployee(null);
    reset({ name: '', position: '', email: '', profileImage: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    reset(employee);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('profileImage', reader.result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    const isEmailTaken = employees.some(emp => emp.email === data.email && emp.id !== editingEmployee?.id);
    if (isEmailTaken) {
      alert('Email already exists. Please use a unique email.');
      return;
    }

    const finalData = { ...data };
    if (!finalData.profileImage) {
      finalData.profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff&size=200`;
    }

    if (editingEmployee) {
      dispatch(updateEmployee({ ...finalData, id: editingEmployee.id }));
    } else {
      dispatch(addEmployee({ ...finalData, id: Date.now().toString() }));
    }
    setIsModalOpen(false);
    reset();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this employee?')) {
      dispatch(deleteEmployee(id));
    }
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Employee Directory" 
        actions={<Button onClick={openAddModal} icon={Plus}>Add Employee</Button>}
      />

      <div className="employee-grid">
        {employees.length === 0 ? (
          <div className="empty-state">No employees found. Add your first employee to get started.</div>
        ) : (
          employees.map(employee => (
            <div key={employee.id} className="employee-card">
              <div className="employee-image">
                <img src={employee.profileImage} alt={employee.name} />
              </div>
              <div className="employee-info">
                <h3>{employee.name}</h3>
                <p className="position">
                  <Briefcase size={14} /> {employee.position}
                </p>
                <p className="email">
                  <Mail size={14} /> {employee.email}
                </p>
              </div>
              <div className="employee-actions">
                <button onClick={() => openEditModal(employee)} className="action-btn edit" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={(e) => handleDelete(e, employee.id)} className="action-btn delete" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="employee-form">
          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            error={errors.name?.message}
            {...register('name')}
          />
          <Input 
            label="Position" 
            placeholder="Senior Developer" 
            error={errors.position?.message}
            {...register('position')}
          />
          <Input 
            label="Official Email" 
            placeholder="john@powersoft.com" 
            error={errors.email?.message}
            {...register('email')}
          />
          
          <div className="image-upload-group">
            <label className="input-label">Profile Image</label>
            <div className="image-preview-container">
              {profileImg ? (
                <img src={profileImg} alt="Preview" className="image-preview" />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(watch('name') || 'User')}&background=random&color=fff&size=200`} 
                  alt="Default Preview" 
                  className="image-preview" 
                />
              )}
              <div className="upload-controls">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="image-upload" 
                  style={{ display: 'none' }} 
                  onChange={handleImageChange}
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  {profileImg ? 'Change Image' : 'Select Image'}
                </Button>
              </div>
            </div>
            {errors.profileImage && <span className="error-message">{errors.profileImage.message}</span>}
          </div>

          <div className="form-submit">
            <Button type="submit">{editingEmployee ? 'Update Employee' : 'Save Employee'}</Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
