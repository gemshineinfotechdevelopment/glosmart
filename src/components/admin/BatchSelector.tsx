import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface Batch {
  _id: string;
  batchName: string;
  maxCapacity: number;
  effectiveStudentsCount: number;
  status: string;
  courseName?: string;
  courseId?: any;
}

interface BatchSelectorProps {
  courseId?: string;
  value: string;
  onChange: (value: string) => void;
  excludeBatchId?: string;
  label?: string;
  showAllCourses?: boolean;
}

const BatchSelector: React.FC<BatchSelectorProps> = ({
  courseId,
  value,
  onChange,
  excludeBatchId,
  label = "Select Batch",
  showAllCourses = false
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!showAllCourses && !courseId) return;

    const fetchBatches = async () => {
      setLoading(true);
      setError('');
      try {
        const url = showAllCourses 
          ? `${API_BASE_URL}/api/batches` 
          : `${API_BASE_URL}/api/batches/course/${courseId}`;
        const res = await axios.get(url);
        // Filter out inactive/completed batches and optionally the current batch
        const activeBatches = res.data.filter((b: Batch) => {
          if (b.status === 'COMPLETED' || b.status === 'INACTIVE') return false;
          if (excludeBatchId && b._id === excludeBatchId) return false;
          return true;
        });
        setBatches(activeBatches);
      } catch (err) {
        console.error('Error fetching batches:', err);
        setError('Failed to load batches');
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [courseId, excludeBatchId, showAllCourses]);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {loading ? (
        <div className="text-xs text-[#6247df] font-semibold animate-pulse">Loading batches...</div>
      ) : error ? (
        <div className="text-xs text-red-500 font-semibold">{error}</div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-semibold text-slate-700 cursor-pointer"
        >
          <option value="">-- Choose a Batch --</option>
          {batches.map((batch) => {
            const currentSize = batch.effectiveStudentsCount ?? 0;
            const maxCap = batch.maxCapacity ?? 30;
            const isFull = currentSize >= maxCap;
            const cName = (batch.courseId && typeof batch.courseId === 'object')
              ? (batch.courseId as any).courseName
              : (batch.courseName || '');

            return (
              <option 
                key={batch._id} 
                value={batch._id} 
                disabled={isFull}
                className={isFull ? 'text-red-400 bg-red-50/50' : 'text-slate-700'}
              >
                {batch.batchName} ({currentSize}/{maxCap}){isFull ? ' [FULL]' : ''}{showAllCourses && cName ? ` [${cName}]` : ''}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
};

export default BatchSelector;
