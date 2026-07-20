import React, { useState, useEffect } from 'react';
import { FiBell, FiMail, FiPhone, FiCalendar, FiTrash2, FiCheck, FiInbox, FiAlertCircle } from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000';

interface NotificationItem {
  _id: string;
  name: string;
  phone?: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  notificationType?: 'batch_purchase' | 'course_purchase';
  purchaseAmount?: string;
  courseName?: string;
}

const AdminNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/notifications`);
      if (!res.ok) throw new Error('Failed to load reminders');
      const data = await res.json();
      setNotifications(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (id: string) => {
    try {
      setActionId(id);
      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setNotifications(prev => prev.map(n => n._id === id ? updated : n));
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      setActionId(id);
      const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete reminder');
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 md:p-10 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1c1c28] mb-1 flex items-center gap-2">
                <FiBell className="text-[#6247df]" /> Reminders & Notifications
              </h2>
              <p className="text-slate-500 font-medium">Review and respond to messages submitted via the contact form.</p>
            </div>
            <button
              onClick={fetchNotifications}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm transition-all"
            >
              Refresh Inbox
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3 font-semibold text-sm">
              <FiAlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#6247df]">
                <FiBell size={22} />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reminders</span>
                <span className="text-2xl font-extrabold text-slate-800">{totalCount}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)] flex items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <FiInbox size={22} />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unread Reminders</span>
                <span className="text-2xl font-extrabold text-slate-800">{unreadCount}</span>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6247df]"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <FiInbox size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#1c1c28] mb-1">All Caught Up!</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto">There are no reminders or contact messages left to review right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => {
                const displayName = user?.role === 'teacher' && notif.notificationType ? 'Student' : notif.name;
                const showContacts = !(user?.role === 'teacher' && notif.notificationType);
                let displayMessage = notif.message;
                if (user?.role === 'teacher') {
                  if (notif.notificationType === 'batch_purchase') {
                    displayMessage = 'A new student joined our batch';
                  } else if (notif.notificationType === 'course_purchase') {
                    displayMessage = `A new student purchased course (Amount: ${notif.purchaseAmount || 'N/A'})`;
                  }
                }
                return (
                  <div
                    key={notif._id}
                    className={`bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.01)] border transition-all duration-300 p-6 flex flex-col md:flex-row gap-5 items-start justify-between ${
                      notif.isRead 
                        ? 'border-slate-100 opacity-75' 
                        : 'border-l-4 border-l-[#6247df] border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="flex-1 w-full">
                      {/* Header: Name and Date */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-extrabold text-[#1c1c28]">{displayName}</h4>
                          {!notif.isRead && (
                            <span className="bg-[#6247df] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                          <FiCalendar size={13} />
                          {new Date(notif.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>

                      {/* Contacts info */}
                      {showContacts && (
                        <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <FiMail size={13} className="text-slate-400" />
                            <a href={`mailto:${notif.email}`} className="hover:text-[#6247df] hover:underline transition-colors">{notif.email}</a>
                          </span>
                          {notif.phone && (
                            <span className="flex items-center gap-1.5">
                              <FiPhone size={13} className="text-slate-400" />
                              <a href={`tel:${notif.phone}`} className="hover:text-[#6247df] hover:underline transition-colors">{notif.phone}</a>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message Body */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                        {displayMessage}
                      </div>
                    </div>

                    {/* Actions column */}
                    <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto pt-4 md:pt-0 md:pl-4 border-t md:border-t-0 md:border-l border-slate-100 justify-end">
                      <button
                        onClick={() => handleToggleRead(notif._id)}
                        disabled={actionId === notif._id}
                        className={`flex-1 md:w-28 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          notif.isRead
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-[#6247df]/10 text-[#6247df] hover:bg-[#6247df]/20'
                        }`}
                      >
                        <FiCheck size={14} />
                        {notif.isRead ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        onClick={() => handleDelete(notif._id)}
                        disabled={actionId === notif._id}
                        className="py-2.5 px-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5 font-bold text-xs"
                      >
                        <FiTrash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </div>
  );
};

export default AdminNotificationsPage;
