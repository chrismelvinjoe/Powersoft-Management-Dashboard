import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Edit2, Trash2, Calendar, User, Layers, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { addTask, updateTask, deleteTask } from '../store/taskSlice';
import { updateProject } from '../store/projectSlice';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import './TasksPage.css';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  projectId: yup.string().required('Project selection is required'),
  assignedEmployeeId: yup.string().required('Employee selection is required'),
  eta: yup.string().required('ETA is required'),
  referenceImages: yup.array().of(yup.string()),
});

const TasksPage = () => {
  const dispatch = useDispatch();
  const { tasks } = useSelector(state => state.tasks);
  const { projects } = useSelector(state => state.projects);
  const { employees } = useSelector(state => state.employees);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = filterProject === 'all' || task.projectId === filterProject;
    const matchesAssignee = filterAssignee === 'all' || task.assignedEmployeeId === filterAssignee;
    return matchesSearch && matchesProject && matchesAssignee;
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      projectId: '',
      assignedEmployeeId: '',
      eta: '',
      referenceImages: [],
      status: 'Need to Do'
    }
  });

  const selectedProjectId = watch('projectId');
  const referenceImages = watch('referenceImages') || [];

  // Show only employees already assigned to the select project
  const availableEmployees = React.useMemo(() => {
    if (!selectedProjectId) return [];
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return [];
    return employees.filter(emp => project.assignedEmployees.includes(emp.id));
  }, [selectedProjectId, employees, projects]);

  // Synchronize assignedEmployeeId if it becomes invalid for the selected project
  useEffect(() => {
    if (selectedProjectId) {
      const currentEmpId = watch('assignedEmployeeId');
      if (currentEmpId && !availableEmployees.some(emp => emp.id === currentEmpId)) {
        setValue('assignedEmployeeId', '');
      }
    }
  }, [selectedProjectId, availableEmployees, setValue, watch]);

  const openAddModal = () => {
    setEditingTask(null);
    reset({
      title: '', description: '', projectId: '',
      assignedEmployeeId: '', eta: '', referenceImages: [],
      status: 'Need to Do'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    reset(task);
    setIsModalOpen(true);
  };

  const openDetailModal = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...referenceImages];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result);
        setValue('referenceImages', [...newImages], { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = [...referenceImages];
    newImages.splice(index, 1);
    setValue('referenceImages', newImages, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    // Employee is already validated to be part of the project via the dropdown filtering

    const finalData = { ...data };
    if (!finalData.referenceImages || finalData.referenceImages.length === 0) {
      finalData.referenceImages = ['https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80']; // High quality checklist/task image
    }

    if (editingTask) {
      dispatch(updateTask({ ...finalData, id: editingTask.id }));
    } else {
      dispatch(addTask({ ...finalData, id: Date.now().toString() }));
    }
    setIsModalOpen(false);
    reset();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!id) return;
    if (window.confirm('Delete this task?')) {
      dispatch(deleteTask(id));
    }
  };

  const getProjectName = (id) => projects.find(p => p.id === id)?.title || 'Unknown';
  const getEmployeeName = (id) => employees.find(e => e.id === id)?.name || 'Unassigned';

  return (
    <div className="page-container">
      <PageHeader
        title="Task Management"
        actions={<Button onClick={openAddModal} icon={Plus}>Add Task</Button>}
      />

      <div className="task-filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
            <option value="all">All Assignees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            {tasks.length === 0 
              ? "No tasks created yet. Start by adding a task to a project." 
              : "No tasks match your filters."}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Project</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>ETA</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className="task-cell-title clickable" onClick={() => openDetailModal(task)}>
                        <strong>{task.title}</strong>
                        <span className="task-desc-hint">{task.description.substring(0, 30)}...</span>
                      </div>
                    </td>
                    <td><span className="badge badge-project">{getProjectName(task.projectId)}</span></td>
                    <td>
                      <div className="assignee-cell">
                        <User size={14} /> {getEmployeeName(task.assignedEmployeeId)}
                      </div>
                    </td>
                    <td><span className={`status-pill status-${task.status.toLowerCase().replace(/ /g, '-')}`}>{task.status}</span></td>
                    <td>
                      <div className="eta-cell">
                        <Calendar size={14} /> {task.eta}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => openEditModal(task)} className="action-btn edit"><Edit2 size={16} /></button>
                        <button onClick={(e) => handleDelete(e, task.id)} className="action-btn delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="task-form">
          <Input label="Task Title" placeholder="Develop Auth Logic" error={errors.title?.message} {...register('title')} />

          <div className="input-group">
            <label className="input-label">Task Description</label>
            <textarea className={`input-field textarea ${errors.description ? 'input-error' : ''}`} {...register('description')} />
            {errors.description && <span className="error-message">{errors.description.message}</span>}
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Linked Project</label>
              <select className={`input-field ${errors.projectId ? 'input-error' : ''}`} {...register('projectId')}>
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              {errors.projectId && <span className="error-message">{errors.projectId.message}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Assigned Employee</label>
              <select
                className={`input-field ${errors.assignedEmployeeId ? 'input-error' : ''}`}
                disabled={!selectedProjectId}
                {...register('assignedEmployeeId')}
              >
                <option value="">
                  {!selectedProjectId 
                    ? 'Select Project First' 
                    : availableEmployees.length === 0 
                      ? 'No Employees Assigned to this Project' 
                      : 'Select Employee'}
                </option>
                {availableEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              {errors.assignedEmployeeId && <span className="error-message">{errors.assignedEmployeeId.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <Input label="ETA" type="date" error={errors.eta?.message} {...register('eta')} />
            <div className="input-group">
              <label className="input-label">Initial Status</label>
              <select className="input-field" {...register('status')}>
                <option value="Need to Do">Need to Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Need for Test">Need for Test</option>
                <option value="Completed">Completed</option>
                <option value="Re-open">Re-open</option>
              </select>
            </div>
          </div>

          <div className="image-upload-group">
            <label className="input-label">Reference Images</label>
            <div className={`multi-image-preview ${errors.referenceImages ? 'input-error' : ''}`}>
              {referenceImages.map((img, idx) => (
                <div key={idx} className="preview-thumb">
                  <img src={img} alt="Ref" />
                  <button type="button" className="remove-thumb" onClick={() => removeImage(idx)}><Trash2 size={12} /></button>
                </div>
              ))}
              <label className="upload-add-btn">
                <Plus size={24} />
                <input type="file" multiple accept="image/*" hidden onChange={handleImagesChange} />
              </label>
            </div>
            {errors.referenceImages && <span className="error-message">{errors.referenceImages.message}</span>}
          </div>

          <div className="form-submit">
            <Button type="submit">{editingTask ? 'Update Task' : 'Create Task'}</Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Task Details"
      >
        {selectedTask && (
          <div className="task-detail-view">
            <div className="detail-header">
              <span className="badge badge-project">{getProjectName(selectedTask.projectId)}</span>
              <span className={`status-pill status-${selectedTask.status.toLowerCase().replace(/ /g, '-')}`}>{selectedTask.status}</span>
            </div>
            
            <h2 className="detail-title">{selectedTask.title}</h2>
            
            <div className="detail-meta">
              <div className="meta-item">
                <User size={16} />
                <span>Assigned to: <strong>{getEmployeeName(selectedTask.assignedEmployeeId)}</strong></span>
              </div>
              <div className="meta-item">
                <Calendar size={16} />
                <span>Deadline: <strong>{selectedTask.eta}</strong></span>
              </div>
            </div>

            <div className="detail-section">
              <label>Description</label>
              <p>{selectedTask.description}</p>
            </div>

            {selectedTask.referenceImages && selectedTask.referenceImages.length > 0 && (
              <div className="detail-section">
                <label>Reference Images</label>
                <div className="detail-images-grid">
                  {selectedTask.referenceImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Ref ${idx}`} className="detail-img" onClick={() => window.open(img, '_blank')} />
                  ))}
                </div>
              </div>
            )}

            <div className="detail-actions">
              <Button onClick={() => { setIsDetailModalOpen(false); openEditModal(selectedTask); }} icon={Edit2}>Edit Task</Button>
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TasksPage;
