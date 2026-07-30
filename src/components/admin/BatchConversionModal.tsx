import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { FiX, FiInfo, FiAlertTriangle } from 'react-icons/fi';
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

interface BatchConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  
  student: Student;
  defaultValues?: {
    newBatchId?: string;
    effectiveDate?: string;
    reason?: string;
  };
}

interface FormInputs {
  newBatchId: string;
  effectiveDate: string;
  reason: string;
}

const BatchConversionModal: React.FC<BatchConversionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  student,
  defaultValues
}) => {
  const { user } = useAuth();
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      newBatchId: defaultValues?.newBatchId || '',
      effectiveDate: defaultValues?.effectiveDate || new Date().toISOString().split('T')[0],
      reason: defaultValues?.reason || ''
    }
  });

  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptFutureTransfers, setPromptFutureTransfers] = useState(false);
  const [futureTransfersCount, setFutureTransfersCount] = useState(0);
  const [formDataCache, setFormDataCache] = useState<FormInputs | null>(null);

  if (!isOpen) return null;

  const submitConversion = async (data: FormInputs, cancelFuture = false) => {
    setLoading(true);
    setApiError('');
    try {
      const payload = {
        studentId: student._id,
        courseId: student.courseId,
        newBatchId: data.newBatchId,
        effectiveDate: data.effectiveDate,
        reason: data.reason,
        cancelFutureTransfers: cancelFuture
      };

      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      };

      const res = await axios.post(`${API_BASE_URL}/api/transfers/batch-conversions`, payload, config);

      if (res.data.status === 'PROMPT_FUTURE_TRANSFERS') {
        setFutureTransfersCount(res.data.futureTransfersCount);
        setFormDataCache(data);
        setPromptFutureTransfers(true);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Error converting batch:', err);
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: FormInputs) => {
    submitConversion(data, false);
  };

  const handleConfirmCancelFuture = () => {
    if (formDataCache) {
      submitConversion(formDataCache, true);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 leading-tight">Permanent Batch Conversion</h3>
            <p className="text-slate-400 text-xs mt-1 font-medium">Change student's enrolled batch permanently.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6">
          {promptFutureTransfers ? (
            <div className="space-y-6">
              <div className="p-5 bg-amber-50 text-amber-900 border border-amber-200 rounded-3xl flex items-start gap-4">
                <FiAlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={24} />
                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">Scheduled Transfers Found</h4>
                  <p className="text-xs font-semibold text-amber-700 leading-relaxed">
                    This student has <strong>{futureTransfersCount}</strong> scheduled temporary transfers in the future.
                    If you permanently convert their batch now, these future transfers might conflict or become obsolete.
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600">Would you like to cancel these scheduled temporary transfers automatically?</p>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => submitConversion(formDataCache!, false)}
                  disabled={loading}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-2xl text-sm transition-colors cursor-pointer"
                >
                  No, Keep Them
                </button>
                <button
                  onClick={handleConfirmCancelFuture}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors shadow-md shadow-red-200 cursor-pointer"
                >
                  Yes, Cancel Them
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              {/* New Batch Dropdown */}
              <Controller
                name="newBatchId"
                control={control}
                rules={{ required: 'Please select a new batch for conversion.' }}
                render={({ field }) => (
                  <BatchSelector
                    excludeBatchId={student.batchId}
                    value={field.value}
                    onChange={field.onChange}
                    label="Select New Batch"
                    showAllCourses={true}
                  />
                )}
              />
              {errors.newBatchId && (
                <p className="text-xs text-red-500 font-semibold">{errors.newBatchId.message}</p>
              )}

              {/* Effective Date */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Effective Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                  {...register('effectiveDate', { required: 'Effective Date is required' })}
                />
                {errors.effectiveDate && (
                  <p className="text-xs text-red-500 font-semibold">{errors.effectiveDate.message}</p>
                )}
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Reason for Conversion</label>
                <textarea
                  placeholder="Provide reason for permanent schedule change..."
                  rows={2}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                  {...register('reason')}
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
                  {loading ? 'Saving...' : 'Convert Batch'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchConversionModal;
