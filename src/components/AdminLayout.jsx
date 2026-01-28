import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminNavbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

