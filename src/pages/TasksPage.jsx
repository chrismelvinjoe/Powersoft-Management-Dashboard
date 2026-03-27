import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Plus, Edit2, Trash2, Calendar, User, Layers, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { fetchTasks, addTaskAsync, updateTaskAsync, deleteTaskAsync } from '../store/taskSlice';
import { fetchProjects, updateProjectAsync } from '../store/projectSlice';
import { fetchEmployees } from '../store/employeeSlice';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import './TasksPage.css';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  projectId: yup.string().required('Project selection is required'),
  assignedEmployeeIds: yup.array().of(yup.string()).min(1, 'At least one employee must be selected'),
  eta: yup.string().required('ETA is required'),
  referenceImages: yup.array().of(yup.string()),
});

const TasksPage = () => {
  const dispatch = useDispatch();
  const { tasks } = useSelector(state => state.tasks);
  const { projects } = useSelector(state => state.projects);
  const { employees } = useSelector(state => state.employees);

  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchProjects());
    dispatch(fetchEmployees());
  }, [dispatch]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [isCompressing, setIsCompressing] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = filterProject === 'all' || task.projectId === filterProject;
    const matchesAssignee = filterAssignee === 'all' || (task.assignedEmployeeIds && task.assignedEmployeeIds.includes(filterAssignee));
    return matchesSearch && matchesProject && matchesAssignee;
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      projectId: '',
      assignedEmployeeIds: [],
      eta: '',
      referenceImages: [],
      status: 'Need to Do'
    }
  });

  const selectedProjectId = watch('projectId');
  const referenceImages = watch('referenceImages') || [];

  const availableEmployees = React.useMemo(() => {
    if (!selectedProjectId) return [];
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return [];
    return employees.filter(emp => project.assignedEmployees.includes(emp.id));
  }, [selectedProjectId, employees, projects]);

  useEffect(() => {
    if (selectedProjectId) {
      const currentEmpIds = watch('assignedEmployeeIds') || [];
      const validEmpIds = currentEmpIds.filter(id =>
        availableEmployees.some(emp => emp.id === id)
      );
      if (currentEmpIds.length !== validEmpIds.length) {
        setValue('assignedEmployeeIds', validEmpIds);
      }
    }
  }, [selectedProjectId, availableEmployees, setValue, watch]);

  const openAddModal = () => {
    setEditingTask(null);
    reset({
      title: '', description: '', projectId: '',
      assignedEmployeeIds: [], eta: '', referenceImages: [],
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

  const compressImage = (base64Str, maxWidth = 1024, maxHeight = 1024) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => {
        console.error("Image loading failed for compression");
        resolve(base64Str); // Fallback to original if compression fails
      };
    });
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setIsCompressing(true);
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const compressed = await compressImage(reader.result);
            resolve(compressed);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64Images = await Promise.all(uploadPromises);
      const updatedImages = [...referenceImages, ...base64Images];
      setValue('referenceImages', updatedImages, { shouldValidate: true });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...referenceImages];
    newImages.splice(index, 1);
    setValue('referenceImages', newImages, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    const finalData = { ...data };
    if (!finalData.referenceImages || finalData.referenceImages.length === 0) {
      finalData.referenceImages = ['https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80'];
    }

    if (editingTask) {
      dispatch(updateTaskAsync({ ...finalData, id: editingTask.id }));
    } else {
      dispatch(addTaskAsync({ ...finalData, id: Date.now().toString() }));
    }
    setIsModalOpen(false);
    reset();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!id) return;
    if (window.confirm('Delete this task?')) {
      dispatch(deleteTaskAsync(id));
    }
  };

  const getProjectName = (id) => projects.find(p => p.id === id)?.title || 'Unknown';
  const getEmployeeNames = (ids) => {
    if (!ids || ids.length === 0) return 'Unassigned';
    return ids.map(id => employees.find(e => e.id === id)?.name).filter(Boolean).join(', ');
  };

  const getEmployeeList = (ids) => {
    if (!ids || ids.length === 0) return [];
    return ids.map(id => employees.find(e => e.id === id)).filter(Boolean);
  };

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
                      <div className="assignee-cell-stack">
                        {getEmployeeList(task.assignedEmployeeIds).slice(0, 2).map(emp => (
                          <div key={emp.id} className="mini-assignee-pill" title={emp.name}>
                            <User size={12} /> {emp.name.split(' ')[0]}
                          </div>
                        ))}
                        {task.assignedEmployeeIds && task.assignedEmployeeIds.length > 2 && (
                          <span className="plus-count">+{task.assignedEmployeeIds.length - 2} more</span>
                        )}
                        {(!task.assignedEmployeeIds || task.assignedEmployeeIds.length === 0) && (
                          <span className="unassigned">Unassigned</span>
                        )}
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

            <div className="input-group full-width">
              <label className="input-label">Assigned Employees</label>
              <div className={`multi-select-container ${errors.assignedEmployeeIds ? 'input-error' : ''} ${!selectedProjectId ? 'disabled' : ''}`}>
                {!selectedProjectId ? (
                  <p className="helper-text">Select a project first to see available employees</p>
                ) : availableEmployees.length === 0 ? (
                  <p className="helper-text">No employees assigned to this project</p>
                ) : (
                  <div className="checkbox-grid">
                    {availableEmployees.map(emp => (
                      <label key={emp.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          value={emp.id}
                          checked={(watch('assignedEmployeeIds') || []).includes(emp.id)}
                          onChange={(e) => {
                            const currentIds = watch('assignedEmployeeIds') || [];
                            if (e.target.checked) {
                              setValue('assignedEmployeeIds', [...currentIds, emp.id], { shouldValidate: true });
                            } else {
                              setValue('assignedEmployeeIds', currentIds.filter(id => id !== emp.id), { shouldValidate: true });
                            }
                          }}
                        />
                        <span>{emp.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.assignedEmployeeIds && <span className="error-message">{errors.assignedEmployeeIds.message}</span>}
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
            <div className={`multi-image-preview ${errors.referenceImages ? 'input-error' : ''} ${isCompressing ? 'loading-images' : ''}`}>
              {isCompressing && <div className="compression-overlay"><div className="spinner"></div><span>Optimizing...</span></div>}
              {referenceImages.length > 0 ? (
                referenceImages.map((img, idx) => (
                  <div key={idx} className="preview-thumb">
                    <img src={img} alt="Ref" />
                    <button type="button" className="remove-thumb" onClick={() => removeImage(idx)}><Trash2 size={12} /></button>
                  </div>
                ))
              ) : (
                <div className="preview-thumb">
                  <img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80" alt="Default Task" />
                </div>
              )}
              <div
                className="upload-add-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Add reference images"
              >
                <Plus size={24} />
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handleImagesChange}
                />
              </div>
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
                <span>Assigned to: <strong>{getEmployeeNames(selectedTask.assignedEmployeeIds)}</strong></span>
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
