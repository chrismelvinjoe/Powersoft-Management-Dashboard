import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Edit2, Trash2, Calendar, Users as UsersIcon, Clock } from 'lucide-react';
import { fetchProjects, addProjectAsync, updateProjectAsync, deleteProjectAsync } from '../store/projectSlice';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import './ProjectsPage.css';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  logo: yup.string(),
  startDate: yup.string().required('Start date is required'),
  startTime: yup.string().required('Start time is required'),
  endDate: yup.string().required('End date is required'),
  endTime: yup.string().required('End time is required'),
  assignedEmployees: yup.array().min(1, 'At least one employee must be assigned').required(),
}).test('date-order', 'Start date must be before end date', function(values) {
  const start = new Date(`${values.startDate}T${values.startTime}`);
  const end = new Date(`${values.endDate}T${values.endTime}`);
  return start < end;
});

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { projects } = useSelector(state => state.projects);
  const { employees } = useSelector(state => state.employees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchEmployees());
  }, [dispatch]);

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      logo: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      assignedEmployees: []
    }
  });

  const logoImg = watch('logo');
  const selectedEmployeeIds = watch('assignedEmployees') || [];

  const openAddModal = () => {
    setEditingProject(null);
    reset({
      title: '', description: '', logo: '',
      startDate: '', startTime: '09:00',
      endDate: '', endTime: '18:00',
      assignedEmployees: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    reset(project);
    setIsModalOpen(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('logo', reader.result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEmployee = (id) => {
    const current = [...selectedEmployeeIds];
    const index = current.indexOf(id);
    if (index === -1) {
      current.push(id);
    } else {
      current.splice(index, 1);
    }
    setValue('assignedEmployees', current, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    const finalData = { ...data };
    if (!finalData.logo) {
      finalData.logo = `https://dummyimage.com/200/6366f1/ffffff&text=${encodeURIComponent(data.title.substring(0, 2).toUpperCase())}`;
    }

    if (editingProject) {
      dispatch(updateProjectAsync({ ...finalData, id: editingProject.id }));
    } else {
      dispatch(addProjectAsync({ ...finalData, id: Date.now().toString() }));
    }
    setIsModalOpen(false);
    reset();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!id) return;
    if (window.confirm('Delete this project and all its associated data?')) {
      dispatch(deleteProjectAsync(id));
    }
  };

  const getEmployeeNames = (ids) => {
    return employees
      .filter(emp => ids.includes(emp.id))
      .map(emp => emp.name)
      .join(', ');
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Project Management" 
        actions={<Button onClick={openAddModal} icon={Plus}>New Project</Button>}
      />

      <div className="project-grid">
        {projects.length === 0 ? (
          <div className="empty-state">No projects found. Create your first project to start managing tasks.</div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <img src={project.logo} alt={project.title} className="project-logo" />
                <div className="project-meta">
                  <h3>{project.title}</h3>
                  <div className="project-dates">
                    <Calendar size={14} /> 
                    <span>{project.startDate} to {project.endDate}</span>
                  </div>
                </div>
              </div>
              <p className="project-desc">{project.description}</p>
              <div className="project-team">
                <UsersIcon size={14} />
                <span>{project.assignedEmployees.length} Employees Assigned</span>
              </div>
              <div className="project-actions">
                <button onClick={() => openEditModal(project)} className="action-btn edit" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={(e) => handleDelete(e, project.id)} className="action-btn delete" title="Delete">
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
        title={editingProject ? 'Edit Project' : 'Create New Project'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="project-form">
          <Input 
            label="Project Title" 
            placeholder="E-commerce App Redesign" 
            error={errors.title?.message}
            {...register('title')}
          />
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea 
              className={`input-field textarea ${errors.description ? 'input-error' : ''}`}
              placeholder="Brief project overview..."
              {...register('description')}
            />
            {errors.description && <span className="error-message">{errors.description.message}</span>}
          </div>

          <div className="image-upload-group">
            <label className="input-label">Project Logo</label>
            <div className="image-preview-container">
              {logoImg ? (
                <img src={logoImg} alt="Preview" className="image-preview" />
              ) : (
                <img 
                  src={`https://dummyimage.com/200/6366f1/ffffff&text=${encodeURIComponent((watch('title') || 'PR').substring(0, 2).toUpperCase())}`} 
                  alt="Default Logo" 
                  className="image-preview" 
                />
              )}
              <div className="upload-controls">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="logo-upload" 
                  style={{ display: 'none' }} 
                  onChange={handleLogoChange}
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => document.getElementById('logo-upload').click()}
                >
                  {logoImg ? 'Change Logo' : 'Select Logo'}
                </Button>
              </div>
            </div>
            {errors.logo && <span className="error-message">{errors.logo.message}</span>}
          </div>

          <div className="form-row">
            <Input label="Start Date" type="date" error={errors.startDate?.message} {...register('startDate')} />
            <Input label="Start Time" type="time" error={errors.startTime?.message} {...register('startTime')} />
          </div>

          <div className="form-row">
            <Input label="End Date" type="date" error={errors.endDate?.message} {...register('endDate')} />
            <Input label="End Time" type="time" error={errors.endTime?.message} {...register('endTime')} />
          </div>

          <div className="employee-selector-group">
            <label className="input-label">Assign Employees</label>
            <div className={`employee-list-selection ${errors.assignedEmployees ? 'input-error' : ''}`}>
              {employees.length === 0 ? (
                <p className="no-emps">Please add employees first in the Directory.</p>
              ) : (
                employees.map(emp => (
                  <div 
                    key={emp.id} 
                    className={`emp-select-item ${selectedEmployeeIds.includes(emp.id) ? 'selected' : ''}`}
                    onClick={() => toggleEmployee(emp.id)}
                  >
                    <img src={emp.profileImage} alt={emp.name} />
                    <span>{emp.name}</span>
                  </div>
                ))
              )}
            </div>
            {errors.assignedEmployees && <span className="error-message">{errors.assignedEmployees.message}</span>}
          </div>

          <div className="form-submit">
            <Button type="submit">{editingProject ? 'Update Project' : 'Create Project'}</Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
