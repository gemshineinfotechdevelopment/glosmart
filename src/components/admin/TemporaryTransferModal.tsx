import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { FiX, FiInfo } from 'react-icons/fi';
import { API_BASE_URL } from '../../config/api';
import BatchSelector from './BatchSelector';
import { useAuth } from '../../context/AuthContext';

interface Student {
  _id: string;
  name: string;
  course: string;
  courseId: string;
  batch: string;
  batchId: string;
}

interface TemporaryTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: Student;
  defaultValues?: {
    transferBatchId?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
    notes?: string;
  };
}

interface FormInputs {
  transferBatchId: string;
  startDate: string;
  endDate: string;
  reason: string;
  notes: string;
}

const TemporaryTransferModal: React.FC<TemporaryTransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  student,
  defaultValues
}) => {
  const { user } = useAuth();
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      transferBatchId: defaultValues?.transferBatchId || '',
      startDate: defaultValues?.startDate || new Date().toISOString().split('T')[0],
      endDate: defaultValues?.endDate || '',
      reason: defaultValues?.reason || '',
      notes: defaultValues?.notes || ''
    }
  });

  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const startDateWatch = watch('startDate');

  if (!isOpen) return null;

  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    setApiError('');
    try {
      const payload = {
        studentId: student._id,
        courseId: student.courseId,
        temporaryBatchId: data.transferBatchId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        notes: data.notes
      };

      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      };

      await axios.post(`${API_BASE_URL}/api/transfers`, payload, config);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating transfer:', err);
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 leading-tight">Temporary Batch Transfer</h3>
            <p className="text-slate-400 text-xs mt-1 font-medium">Temporarily shift student to a different schedule.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto p-6 space-y-4">
          {apiError && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl flex items-center gap-3 font-semibold text-sm leading-tight">
              <FiInfo className="shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Student Info */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-600">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Student</p>
              <p className="text-slate-800 font-extrabold">{student.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Course</p>
              <p className="text-slate-800 font-extrabold">{student.course}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Current Batch</p>
              <p className="text-slate-800 font-extrabold">{student.batch}</p>
            </div>
          </div>

          {/* Target Batch Dropdown */}
          <Controller
            name="transferBatchId"
            control={control}
            rules={{ required: 'Please select a batch to transfer to.' }}
            render={({ field }) => (
              <BatchSelector
                excludeBatchId={student.batchId}
                value={field.value}
                onChange={field.onChange}
                label="Transfer To Batch"
                showAllCourses={true}
              />
            )}
          />
          {errors.transferBatchId && (
            <p className="text-xs text-red-500 font-semibold">{errors.transferBatchId.message}</p>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                min={todayStr}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                {...register('startDate', { required: 'Start Date is required' })}
              />
              {errors.startDate && (
                <p className="text-xs text-red-500 font-semibold">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                min={startDateWatch || todayStr}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                {...register('endDate', { 
                  required: 'End Date is required',
                  validate: val => !startDateWatch || new Date(val) > new Date(startDateWatch) || 'End Date must be greater than Start Date'
                })}
              />
              {errors.endDate && (
                <p className="text-xs text-red-500 font-semibold">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Reason for Transfer</label>
            <input
              type="text"
              placeholder="e.g., Exams, School vacation, Medical leave..."
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
              {...register('reason')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</label>
            <textarea
              placeholder="Additional comments or instructions..."
              rows={2}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
              {...register('notes')}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex gap-4 bg-white shrink-0 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-2xl text-sm transition-colors focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#6247df] hover:bg-[#5035c9] text-white font-bold py-3.5 rounded-2xl text-sm transition-colors shadow-md shadow-purple-200 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemporaryTransferModal;
