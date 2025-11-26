'use client';

import { FormEvent, useState } from 'react';

type StaffType = 'Waiter' | 'Cleaner';
type SalaryCycle = 'Daily' | 'Weekly' | 'Monthly';

interface StaffForm {
  staffType: StaffType;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  salary: string;
  salaryCycle: SalaryCycle;
}

const INITIAL_FORM: StaffForm = {
  staffType: 'Waiter',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  salary: '',
  salaryCycle: 'Monthly',
};

const STAFF_TYPE_OPTIONS: { label: string; value: StaffType }[] = [
  { label: 'Waiter', value: 'Waiter' },
  { label: 'Cleaner', value: 'Cleaner' },
];

const SALARY_CYCLE_OPTIONS: { label: string; value: SalaryCycle }[] = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
];

export default function SuperadminStaffPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<StaffForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setForm(INITIAL_FORM);
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    
    // TODO: Add backend integration here
    // For now, just simulate a delay and close the modal
    setTimeout(() => {
      console.log('Staff form submitted:', form);
      setSubmitting(false);
      setShowModal(false);
      resetForm();
    }, 500);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff directory</h1>
          <p className="mt-2 text-sm text-slate-500">
            View-only listing of all staff members across your restaurant branches.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Add staff
        </button>
      </header>

      <Modal
        title="Add staff"
        open={showModal}
        onClose={handleCloseModal}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="staff-type">
              Staff type
            </label>
            <select
              id="staff-type"
              required
              value={form.staffType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, staffType: event.target.value as StaffType }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            >
              {STAFF_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="first-name">
              First name
            </label>
            <input
              id="first-name"
              type="text"
              required
              value={form.firstName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, firstName: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter first name"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="last-name">
              Last name
            </label>
            <input
              id="last-name"
              type="text"
              required
              value={form.lastName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, lastName: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter last name"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="phone-number">
              Phone number
            </label>
            <input
              id="phone-number"
              type="tel"
              required
              value={form.phoneNumber}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1234567890"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="salary">
              Salary
            </label>
            <input
              id="salary"
              type="number"
              required
              min="0"
              step="0.01"
              value={form.salary}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, salary: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600" htmlFor="salary-cycle">
              Salary cycle
            </label>
            <select
              id="salary-cycle"
              required
              value={form.salaryCycle}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, salaryCycle: event.target.value as SalaryCycle }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            >
              {SALARY_CYCLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Adding…' : 'Add staff'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
