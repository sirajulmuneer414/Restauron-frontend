import NotificationHandler from '../../components/common/NotificationHandler';
import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import { Outlet } from 'react-router-dom';

function EmployeeLayoutPage() {
  return (
    <div className="flex bg-black/50">
      <NotificationHandler />
      <EmployeeSidebar />
      <main className="grow h-screen overflow-y-auto">
        <Outlet /> {/* Child routes like Dashboard and Profile will render here */}
      </main>
    </div>
  );
}

export default EmployeeLayoutPage;
