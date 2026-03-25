import { addEmployee } from './store/employeeSlice';
import { addProject } from './store/projectSlice';
import { addTask } from './store/taskSlice';
import { setInitialized } from './store/appSlice';

export const seedDatabase = (store) => {
  const state = store.getState();
  
  if (state.app.isInitialized) return;

  store.dispatch(setInitialized());

  const emp1Id = 'emp-1';
  const emp2Id = 'emp-2';
  const proj1Id = 'proj-1';

  store.dispatch(addEmployee({
    id: emp1Id,
    name: 'Alex Johnson',
    position: 'Lead Developer',
    email: 'alex@powersoft.com',
    profileImage: 'https://i.pravatar.cc/150?u=alex'
  }));

  store.dispatch(addEmployee({
    id: emp2Id,
    name: 'Sarah Smith',
    position: 'UI Designer',
    email: 'sarah@powersoft.com',
    profileImage: 'https://i.pravatar.cc/150?u=sarah'
  }));

  store.dispatch(addProject({
    id: proj1Id,
    title: 'Dashboard Redesign',
    description: 'A complete overhaul of the internal management tool.',
    logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968382.png',
    startDate: '2026-04-01',
    startTime: '09:00',
    endDate: '2026-06-30',
    endTime: '18:00',
    assignedEmployees: [emp1Id, emp2Id]
  }));

  store.dispatch(addTask({
    id: 'task-1',
    title: 'Develop Authentication Logic',
    description: 'Implement JWT based auth and route protection.',
    projectId: proj1Id,
    assignedEmployeeId: emp1Id,
    eta: '2026-04-15',
    status: 'In Progress',
    referenceImages: ['https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.png']
  }));

  store.dispatch(addTask({
    id: 'task-2',
    title: 'Design Kanban Board',
    description: 'Create high-fidelity mockups for the drag and drop interface.',
    projectId: proj1Id,
    assignedEmployeeId: emp2Id,
    eta: '2026-04-10',
    status: 'Completed',
    referenceImages: ['https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.png']
  }));
};
