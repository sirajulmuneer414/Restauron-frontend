import OwnerSidebar from '../../components/owner/OwnerSideBar'
import { Outlet } from 'react-router-dom'

function OwnerLayoutPage() {
const OwnerLayout = () => (
    <div className="flex bg-black/50">
        <OwnerSidebar />
        <main className="flex-grow p-6 h-screen overflow-y-auto">
            <Outlet /> {/* Child routes will render here */}
        </main>
    </div>
)


return OwnerLayout();
}

export default OwnerLayoutPage;