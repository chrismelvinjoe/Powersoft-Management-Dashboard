import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, User, Filter, MoreVertical, Briefcase, CheckSquare, FolderKanban } from 'lucide-react';
import { moveTaskAsync } from '../store/taskSlice';
import PageHeader from '../components/PageHeader';
import './DashboardPage.css';

const COLUMNS = [
  { id: 'Need to Do', title: 'Need to Do' },
  { id: 'In Progress', title: 'In Progress' },
  { id: 'Need for Test', title: 'Need for Test' },
  { id: 'Completed', title: 'Completed' },
  { id: 'Re-open', title: 'Re-open' },
];

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { tasks } = useSelector(state => state.tasks);
  const { projects } = useSelector(state => state.projects);
  const { employees } = useSelector(state => state.employees);

  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === 'all') return tasks;
    return tasks.filter(t => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    dispatch(moveTaskAsync({
      taskId: draggableId,
      newStatus: destination.droppableId
    }));
  };

  const getEmployees = (ids) => {
    if (!ids || ids.length === 0) return [];
    return ids.map(id => employees.find(e => e.id === id)).filter(Boolean);
  };

  return (
    <div className="page-container dashboard-page">
      <PageHeader
        title="Project Board"
        actions={
          <div className="filter-group">
            <Filter size={18} className="filter-icon" />
            <select
              className="project-filter-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        }
      />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon projects-icon"><FolderKanban size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Projects</span>
            <span className="stat-value">{projects.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon employees-icon"><Briefcase size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Team Members</span>
            <span className="stat-value">{employees.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tasks-icon"><CheckSquare size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Active Tasks</span>
            <span className="stat-value">{tasks.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed-icon"><CheckSquare size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{tasks.filter(t => t.status === 'Completed').length}</span>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map(column => (
            <div key={column.id} className="kanban-column">
              <div className="column-header">
                <h3>{column.title}</h3>
                <span className="task-count">
                  {filteredTasks.filter(t => t.status === column.id).length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {filteredTasks
                      .filter(t => t.status === column.id)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <div className="task-card-header">
                                <span className="task-project-tag">
                                  {projects.find(p => p.id === task.projectId)?.title}
                                </span>
                                <MoreVertical size={14} className="card-menu-icon" />
                              </div>

                              <h4 className="task-card-title">{task.title}</h4>

                              <div className="task-card-images">
                                {task.referenceImages && task.referenceImages[0] && (
                                  <img src={task.referenceImages[0]} alt="Task Ref" className="task-main-img" />
                                )}
                              </div>

                              <div className="task-card-footer">
                                <div className="card-assignee">
                                  {task.assignedEmployeeIds && task.assignedEmployeeIds.length > 0 ? (
                                    <div className="assignee-avatar-group">
                                      {getEmployees(task.assignedEmployeeIds).slice(0, 3).map(emp => (
                                        <img
                                          key={emp.id}
                                          src={emp.profileImage}
                                          alt={emp.name}
                                          title={emp.name}
                                        />
                                      ))}
                                      {task.assignedEmployeeIds.length > 3 && (
                                        <span className="assignee-more">+{task.assignedEmployeeIds.length - 3}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="unassigned"><User size={12} /> Unassigned</div>
                                  )}
                                </div>
                                <div className="card-eta">
                                  <Calendar size={12} />
                                  <span>{task.eta}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default DashboardPage;
