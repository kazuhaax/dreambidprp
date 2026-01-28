import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Navbar />
      <main className="relative flex-grow"><Outlet /></main>
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-8 sm:py-12 mt-16 sm:mt-20 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">DreamBid</h3>
              <p className="text-gray-400 text-sm sm:text-base">Your trusted platform for premium property auctions.</p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-red-400 transition-colors text-sm sm:text-base">Home</Link></li>
                <li><Link to="/properties" className="hover:text-red-400 transition-colors text-sm sm:text-base">Properties</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm sm:text-base">Get in touch for property enquiries</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">© 2024 DreamBid. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

