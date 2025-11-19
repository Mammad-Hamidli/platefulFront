import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { User, UserRole } from '../../types';
import { useUIStore } from '../../store/uiStore';

export const OwnerUsersPage: React.FC = () => {
  const { user } = useAuthStore();
  const { isModalOpen, openModal, closeModal, showToast } = useUIStore();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    email: '',
    role: 'WAITER',
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', user?.restaurantId, user?.branchId],
    queryFn: () => getUsers(user?.restaurantId, user?.branchId),
    enabled: !!user?.restaurantId,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User created successfully', 'success');
      closeModal('user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<User> }) =>
      updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User updated successfully', 'success');
      closeModal('user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User deleted successfully', 'success');
    },
  });

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      role: 'WAITER',
    });
    openModal('user');
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    openModal('user');
  };

  const handleSubmit = () => {
    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        updates: formData,
      });
    } else {
      createMutation.mutate({
        ...formData,
        restaurantId: user?.restaurantId,
        branchId: user?.branchId,
      } as Omit<User, 'id' | 'createdAt'>);
    }
  };

  const handleDelete = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };

  const columns = [
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    {
      key: 'actions',
      header: 'Actions',
      render: (userItem: User) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(userItem)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(userItem.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button variant="primary" onClick={handleCreate}>
          Add User
        </Button>
      </div>

      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <Table data={users} columns={columns} />
      )}

      <Modal
        isOpen={isModalOpen('user')}
        onClose={() => closeModal('user')}
        title={editingUser ? 'Edit User' : 'Create User'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="WAITER">Waiter</option>
              <option value="KITCHEN">Kitchen</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingUser ? 'Update' : 'Create'}
            </Button>
            <Button variant="outline" onClick={() => closeModal('user')} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

