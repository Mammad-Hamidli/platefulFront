import React, { useState } from 'react';
import { useMenu, useMenuMutations } from '../../hooks/useMenu';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Table } from '../../components/Table';
import { MenuItem } from '../../types';
import { useUIStore } from '../../store/uiStore';

export const OwnerMenuPage: React.FC = () => {
  const { user } = useAuthStore();
  const { menu, isLoading } = useMenu(user?.restaurantId || 0, user?.branchId);
  const { createItem, updateItem, deleteItem, isCreating, isUpdating } =
    useMenuMutations();
  const { isModalOpen, openModal, closeModal } = useUIStore();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    available: true,
  });

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      available: true,
    });
    openModal('menuItem');
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    openModal('menuItem');
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateItem(
        {
          id: editingItem.id,
          updates: {
            ...formData,
            restaurantId: user?.restaurantId,
            branchId: user?.branchId,
          },
        },
        {
          onSuccess: () => {
            closeModal('menuItem');
          },
        }
      );
    } else {
      createItem(
        {
          ...formData,
          restaurantId: user?.restaurantId || 0,
          branchId: user?.branchId,
        } as Omit<MenuItem, 'id' | 'createdAt'>,
        {
          onSuccess: () => {
            closeModal('menuItem');
          },
        }
      );
    }
  };

  const handleDelete = (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      deleteItem(itemId);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'category',
      header: 'Category',
    },
    {
      key: 'price',
      header: 'Price',
      render: (item: MenuItem) => `$${item.price.toFixed(2)}`,
    },
    {
      key: 'available',
      header: 'Status',
      render: (item: MenuItem) => (
        <span className={item.available ? 'text-green-600' : 'text-red-600'}>
          {item.available ? 'Available' : 'Unavailable'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: MenuItem) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Button variant="primary" onClick={handleCreate}>
          Add Menu Item
        </Button>
      </div>

      {isLoading ? (
        <p>Loading menu...</p>
      ) : (
        <Table data={menu} columns={columns} />
      )}

      <Modal
        isOpen={isModalOpen('menuItem')}
        onClose={() => closeModal('menuItem')}
        title={editingItem ? 'Edit Menu Item' : 'Create Menu Item'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Available</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isCreating || isUpdating}
              className="flex-1"
            >
              {editingItem ? 'Update' : 'Create'}
            </Button>
            <Button variant="outline" onClick={() => closeModal('menuItem')} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

