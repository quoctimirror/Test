import React, { useState, useEffect } from "react";
import { usersAPI, handleAPIError } from "@services/api";

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phoneNumber: "",
    password: "",
    role: "USER",
    status: "ACTIVE",
    dateOfBirth: "",
    address: "",
    city: "",
    preferences: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Try to fetch from API, fall back to mock data if not available
      try {
        const response = await usersAPI.getAll();
        // Handle paginated response structure - users are in content property
        const usersData = Array.isArray(response.data?.content) ? response.data.content : 
                         Array.isArray(response.data) ? response.data : [];
        setUsers(usersData);
        return;
      } catch (apiError) {
        // Users API not available, using mock data
      }
      
      // Mock data fallback
      const mockUsers = [
        {
          id: "USR000001",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          username: "johndoe",
          phoneNumber: "+84 901 234 567",
          role: "ADMIN",
          status: "ACTIVE",
          dateOfBirth: "1985-03-15",
          address: "123 Main Street",
          city: "Ho Chi Minh City",
          preferences: "Email notifications, SMS alerts",
          createdAt: "2024-01-15T10:30:00Z",
          lastLogin: "2024-08-20T14:25:00Z"
        },
        {
          id: "USR000002",
          firstName: "Jane",
          lastName: "Smith", 
          email: "jane.smith@example.com",
          username: "janesmith",
          phoneNumber: "+84 902 345 678",
          role: "STAFF",
          status: "ACTIVE",
          dateOfBirth: "1990-07-22",
          address: "456 Oak Avenue",
          city: "Hanoi",
          preferences: "Email notifications only",
          createdAt: "2024-02-10T09:15:00Z",
          lastLogin: "2024-08-21T08:45:00Z"
        },
        {
          id: "USR000003",
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@example.com", 
          username: "mikej",
          phoneNumber: "+84 903 456 789",
          role: "CUSTOMER",
          status: "ACTIVE",
          dateOfBirth: "1988-11-30",
          address: "789 Pine Road",
          city: "Da Nang",
          preferences: "SMS alerts only",
          createdAt: "2024-03-05T16:20:00Z",
          lastLogin: "2024-08-19T19:30:00Z"
        },
        {
          id: "USR000004",
          firstName: "Sarah",
          lastName: "Wilson",
          email: "sarah.wilson@example.com",
          username: "sarahw",
          phoneNumber: "+84 904 567 890",
          role: "CUSTOMER",
          status: "INACTIVE",
          dateOfBirth: "1992-05-14",
          address: "321 Elm Street",
          city: "Can Tho",
          preferences: "No notifications",
          createdAt: "2024-01-28T11:45:00Z",
          lastLogin: "2024-07-15T13:20:00Z"
        }
      ];
      setUsers(mockUsers);
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to load users');
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      phoneNumber: "",
      password: "",
      role: "USER",
      status: "ACTIVE",
      dateOfBirth: "",
      address: "",
      city: "",
      preferences: ""
    });
    setEditingUser(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || "",
      phoneNumber: user.phoneNumber || "",
      password: "", // Don't pre-fill password for editing
      role: getPrimaryRole(user.roles) || "USER",
      status: getUserStatus(user) || "ACTIVE",
      dateOfBirth: user.dateOfBirth || "",
      address: user.address || "",
      city: user.city || "",
      preferences: user.preferences || ""
    });
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingUser) {
        // Convert status to enabled boolean for the backend
        const updateData = {
          ...formData,
          enabled: formData.status === 'ACTIVE'
        };
        delete updateData.status; // Remove status field as backend uses enabled
        
        // Remove password if empty (optional for updates)
        if (!updateData.password || updateData.password.trim() === '') {
          delete updateData.password;
        }
        
        await usersAPI.update(editingUser.id, updateData);
      } else {
        // Use the admin endpoint for creating users with role assignment
        // Convert status to enabled boolean for the backend
        const submitData = {
          ...formData,
          enabled: formData.status === 'ACTIVE'
        };
        delete submitData.status; // Remove status field as backend uses enabled
        
        // Ensure password is included and not empty
        if (!submitData.password || submitData.password.trim() === '') {
          setError('Password is required for new users');
          return;
        }
        
        await usersAPI.createByAdmin(submitData);
      }

      await fetchUsers();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to save user');
      setError(errorInfo.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await usersAPI.delete(id);
      await fetchUsers();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to delete user');
      setError(errorInfo.message);
    }
  };

  const toggleStatus = async (user) => {
    try {
      const currentStatus = getUserStatus(user);
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await usersAPI.updateStatus(user.id, newStatus);
      await fetchUsers();
    } catch (err) {
      const errorInfo = handleAPIError(err, 'Failed to update user status');
      setError(errorInfo.message);
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || (user.roles && user.roles.includes(selectedRole));
    const userStatus = user.enabled ? "ACTIVE" : "INACTIVE";
    const matchesStatus = selectedStatus === "all" || userStatus === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (roles) => {
    if (!roles || !Array.isArray(roles)) return '';
    if (roles.includes('ADMIN')) return '👑';
    if (roles.includes('VENDOR')) return '';
    if (roles.includes('STAFF')) return '';
    if (roles.includes('USER')) return '';
    return '';
  };

  const getRoleColor = (roles) => {
    if (!roles || !Array.isArray(roles)) return '#6c757d';
    if (roles.includes('ADMIN')) return '#dc3545';
    if (roles.includes('VENDOR')) return '#007bff';
    if (roles.includes('STAFF')) return '#ffc107';
    if (roles.includes('USER')) return '#28a745';
    return '#6c757d';
  };

  const getPrimaryRole = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) return 'USER';
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('VENDOR')) return 'VENDOR';
    if (roles.includes('STAFF')) return 'STAFF';
    if (roles.includes('USER')) return 'USER';
    return roles[0];
  };

  const getUserStatus = (user) => {
    return user.enabled ? "ACTIVE" : "INACTIVE";
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="admin-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div>Loading users...</div>
      </div>
    );
  }

  return (
    <div className="users-manager">
      {error && (
        <div className="admin-card" style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fee', borderColor: '#feb2b2' }}>
          <div style={{ color: '#c53030' }}>{error}</div>
        </div>
      )}

      {/* Header Controls */}
      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
              style={{ flex: 1 }}
            />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="admin-input"
              style={{ width: '120px' }}
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="VENDOR">Vendor</option>
              <option value="USER">User</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="admin-input"
              style={{ width: '120px' }}
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <button onClick={handleAdd} className="admin-button admin-button-primary" title="Add User">
            +
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: getRoleColor(user.roles),
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                    >
                      {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#212529' }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        @{user.username}
                      </div>
                      <div style={{ fontSize: '10px', color: '#adb5bd' }}>
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div style={{ fontSize: '14px', color: '#212529' }}>{user.email}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>{user.phoneNumber}</div>
                    {user.city && (
                      <div style={{ fontSize: '11px', color: '#adb5bd' }}>{user.city}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '16px' }}>{getRoleIcon(user.roles)}</span>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: '500',
                      backgroundColor: getRoleColor(user.roles) + '20',
                      color: getRoleColor(user.roles)
                    }}>
                      {getPrimaryRole(user.roles)}
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: '500',
                    backgroundColor: getUserStatus(user) === 'ACTIVE' ? '#d4edda' : '#f8d7da',
                    color: getUserStatus(user) === 'ACTIVE' ? '#155724' : '#721c24'
                  }}>
                    {getUserStatus(user)}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '13px', color: '#495057' }}>
                    {formatDateTime(user.lastLogin)}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      className="admin-button admin-button-outline"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(user)}
                      className="admin-button admin-button-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '12px' }}
                    >
                      {getUserStatus(user) === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="admin-button"
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        fontSize: '12px',
                        backgroundColor: '#dc3545',
                        color: 'white'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6c757d' }}>
            No users found. {searchTerm || selectedRole !== "all" || selectedStatus !== "all" ? "Try adjusting your filters." : "Add your first user to get started."}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '24px', fontWeight: '600' }}>
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="admin-input"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="admin-input"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="admin-input"
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Username *
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="admin-input"
                        placeholder="johndoe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="admin-input"
                      placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                      required={!editingUser}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className="admin-input"
                        placeholder="+84 901 234 567"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Role *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="admin-input"
                        required
                      >
                        <option value="USER">User</option>
                        <option value="VENDOR">Vendor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="admin-input"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="admin-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="admin-input"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="admin-input"
                        placeholder="Ho Chi Minh City"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Preferences
                    </label>
                    <textarea
                      value={formData.preferences}
                      onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                      className="admin-input"
                      rows="2"
                      placeholder="Email notifications, SMS alerts, etc."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="admin-button admin-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-button admin-button-primary"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;