import EmployeeSidebar from '../../components/employee/EmployeeSidebar';
import { Outlet } from 'react-router-dom';

function EmployeeLayoutPage() {
  return (
    <div className="flex bg-black/50">
      <EmployeeSidebar />
      <main className="flex-grow p-6 h-screen overflow-y-auto">
        <Outlet /> {/* Child routes like Dashboard and Profile will render here */}
      </main>
    </div>
  );
}

export default EmployeeLayoutPage;
