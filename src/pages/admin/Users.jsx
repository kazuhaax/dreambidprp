import { useQuery, useQueryClient } from 'react-query';
import { usersAPI } from '../../services/admin-api';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Users() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 10;

  // Fetch all users
  const { data: usersData, isLoading, refetch } = useQuery(
    ['admin-users', searchTerm, currentPage],
    () => usersAPI.getAll({
      search: searchTerm,
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage
    }),
    {
      refetchInterval: 30000,
      refetchOnWindowFocus: true,
    }
  );

  const { data: userDetailsData, isLoading: detailsLoading } = useQuery(
    ['user-details', selectedUser?.id],
    () => selectedUser ? usersAPI.getById(selectedUser.id) : null,
    {
      enabled: !!selectedUser,
    }
  );

  const users = usersData?.data?.data || [];
  const total = usersData?.data?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await usersAPI.updateStatus(userId, !currentStatus);
      queryClient.invalidateQueries('admin-users');
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      queryClient.invalidateQueries('admin-users');
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-sm text-gray-500 mt-1">Total users: {total}</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-midnight-700 rounded-lg bg-midnight-800 text-text-primary focus:ring-2 focus:ring-gold focus:border-gold placeholder-text-muted"
        />
      </div>

      {/* Users Table */}
      <div className="bg-midnight-900 border border-midnight-700 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-text-secondary">Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-midnight-800 border-b border-midnight-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-midnight-900 divide-y divide-midnight-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-midnight-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">{user.full_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary capitalize">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className={`px-3 py-1 text-xs rounded font-medium transition ${
                          user.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="text-gold hover:text-gold-hover text-sm font-medium transition"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-midnight-600 rounded-lg text-text-primary hover:bg-midnight-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-text-secondary">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-midnight-600 rounded-lg text-text-primary hover:bg-midnight-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-midnight-900 border border-midnight-700 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-midnight-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-primary\">User Details</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-text-muted hover:text-text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {detailsLoading ? (
              <div className="p-6 text-center text-text-secondary">Loading details...</div>
            ) : userDetailsData?.data ? (
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-muted">Full Name</p>
                    <p className="text-lg font-semibold text-text-primary">{selectedUser.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-muted">Email</p>
                    <p className="text-lg font-semibold text-text-primary">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-muted">Phone</p>
                    <p className="text-lg font-semibold text-text-primary">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-muted">Role</p>
                    <p className="text-lg font-semibold text-text-primary capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-muted">Status</p>
                    <p className={`text-lg font-semibold ${selectedUser.is_active ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-muted">Joined</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Activity Stats */}
                {userDetailsData.data.stats && (
                  <div className="border-t border-midnight-700 pt-4">
                    <h3 className="font-semibold text-text-primary mb-3">Activity Summary (Last 30 days)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-midnight-800 border border-midnight-700 p-3 rounded">
                        <p className="text-sm text-text-muted">Total Activities</p>
                        <p className="text-2xl font-bold text-text-primary">{userDetailsData.data.stats.total_activities || 0}</p>
                      </div>
                      <div className="bg-midnight-800 border border-midnight-700 p-3 rounded">
                        <p className="text-sm text-text-muted">Last Activity</p>
                        <p className="text-lg font-bold text-text-primary">
                          {userDetailsData.data.stats.last_activity_date 
                            ? new Date(userDetailsData.data.stats.last_activity_date).toLocaleDateString()
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activities */}
                {userDetailsData.data.activities && userDetailsData.data.activities.length > 0 && (
                  <div className="border-t border-midnight-700 pt-4">
                    <h3 className="font-semibold text-text-primary mb-3">Recent Activities</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userDetailsData.data.activities.map((activity) => (
                        <div key={activity.id} className="text-sm border-b border-midnight-700 pb-2 last:border-0">
                          <p className="font-medium text-text-primary capitalize">{activity.action_type}</p>
                          <p className="text-xs text-text-muted capitalize">{activity.resource_type}</p>
                          <p className="text-xs text-text-muted">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-600">Failed to load user details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
