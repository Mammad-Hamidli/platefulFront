import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTables, createTable, updateTable, deleteTable } from '../../api/tables';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { Table as TableType } from '../../types';
import { useUIStore } from '../../store/uiStore';

export const OwnerTablesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { isModalOpen, openModal, closeModal, showToast } = useUIStore();
  const queryClient = useQueryClient();
  const [editingTable, setEditingTable] = useState<TableType | null>(null);
  const [formData, setFormData] = useState<Partial<TableType>>({
    number: '',
    capacity: 4,
    isAvailable: true,
  });

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables', user?.restaurantId, user?.branchId],
    queryFn: () => getTables(user?.restaurantId || 0, user?.branchId),
    enabled: !!user?.restaurantId,
  });

  const createMutation = useMutation({
    mutationFn: createTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      showToast('Table created successfully', 'success');
      closeModal('table');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<TableType> }) =>
      updateTable(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      showToast('Table updated successfully', 'success');
      closeModal('table');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      showToast('Table deleted successfully', 'success');
    },
  });

  const handleCreate = () => {
    setEditingTable(null);
    setFormData({
      number: '',
      capacity: 4,
      isAvailable: true,
    });
    openModal('table');
  };

  const handleEdit = (table: TableType) => {
    setEditingTable(table);
    setFormData(table);
    openModal('table');
  };

  const handleSubmit = () => {
    if (editingTable) {
      updateMutation.mutate({
        id: editingTable.id,
        updates: formData,
      });
    } else {
      createMutation.mutate({
        ...formData,
        restaurantId: user?.restaurantId || 0,
        branchId: user?.branchId,
      } as Omit<TableType, 'id'>);
    }
  };

  const handleDelete = (tableId: number) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      deleteMutation.mutate(tableId);
    }
  };

  const columns = [
    { key: 'number', header: 'Table Number' },
    { key: 'capacity', header: 'Capacity' },
    {
      key: 'isAvailable',
      header: 'Status',
      render: (table: TableType) => (
        <span className={table.isAvailable ? 'text-green-600' : 'text-red-600'}>
          {table.isAvailable ? 'Available' : 'Occupied'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (table: TableType) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(table)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(table.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Table Management</h1>
        <Button variant="primary" onClick={handleCreate}>
          Add Table
        </Button>
      </div>

      {isLoading ? (
        <p>Loading tables...</p>
      ) : (
        <Table data={tables} columns={columns} />
      )}

      <Modal
        isOpen={isModalOpen('table')}
        onClose={() => closeModal('table')}
        title={editingTable ? 'Edit Table' : 'Create Table'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Available</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingTable ? 'Update' : 'Create'}
            </Button>
            <Button variant="outline" onClick={() => closeModal('table')} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

