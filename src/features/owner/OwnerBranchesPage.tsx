import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../../api/branches';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { Branch } from '../../types';
import { useUIStore } from '../../store/uiStore';

export const OwnerBranchesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { isModalOpen, openModal, closeModal, showToast } = useUIStore();
  const queryClient = useQueryClient();
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    address: '',
    phone: '',
    isActive: true,
  });

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches', user?.restaurantId],
    queryFn: () => getBranches(user?.restaurantId),
    enabled: !!user?.restaurantId,
  });

  const createMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      showToast('Branch created successfully', 'success');
      closeModal('branch');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Branch> }) =>
      updateBranch(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      showToast('Branch updated successfully', 'success');
      closeModal('branch');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      showToast('Branch deleted successfully', 'success');
    },
  });

  const handleCreate = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      isActive: true,
    });
    openModal('branch');
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData(branch);
    openModal('branch');
  };

  const handleSubmit = () => {
    if (editingBranch) {
      updateMutation.mutate({
        id: editingBranch.id,
        updates: formData,
      });
    } else {
      createMutation.mutate({
        ...formData,
        restaurantId: user?.restaurantId || 0,
      } as Omit<Branch, 'id'>);
    }
  };

  const handleDelete = (branchId: number) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      deleteMutation.mutate(branchId);
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'address', header: 'Address' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'isActive',
      header: 'Status',
      render: (branch: Branch) => (
        <span className={branch.isActive ? 'text-green-600' : 'text-red-600'}>
          {branch.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (branch: Branch) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(branch)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(branch.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Branch Management</h1>
        <Button variant="primary" onClick={handleCreate}>
          Add Branch
        </Button>
      </div>

      {isLoading ? (
        <p>Loading branches...</p>
      ) : (
        <Table data={branches} columns={columns} />
      )}

      <Modal
        isOpen={isModalOpen('branch')}
        onClose={() => closeModal('branch')}
        title={editingBranch ? 'Edit Branch' : 'Create Branch'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingBranch ? 'Update' : 'Create'}
            </Button>
            <Button variant="outline" onClick={() => closeModal('branch')} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

