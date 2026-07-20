import React, { useState, useEffect } from 'react';
import { FiSave, FiUser, FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiCheckCircle, FiLock, FiEdit } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000';

interface SettingsData {
  profile: {
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    adminPassword?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };
}

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'profile' | 'footer'>(isAdmin ? 'footer' : 'profile');

  useEffect(() => {
    if (!isAdmin) {
      setActiveTab('profile');
    }
  }, [user]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<SettingsData>({
    profile: { adminName: '', adminEmail: '', adminPhone: '' },
    contactInfo: { phone: '', email: '', address: '' },
    socialLinks: { facebook: '', instagram: '', twitter: '', youtube: '' }
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          profile: {
            adminName: data.profile?.adminName || user?.name || '',
            adminEmail: data.profile?.adminEmail || user?.email || '',
            adminPhone: data.profile?.adminPhone || '',
          },
          contactInfo: data.contactInfo || { phone: '', email: '', address: '' },
          socialLinks: data.socialLinks || { facebook: '', instagram: '', twitter: '', youtube: '' }
        });
      }
    } catch (error) {
      console.error('Failed to load settings', error);
      setMessage({ text: 'Failed to load settings. Please check your connection.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      profile: { ...prev.profile, [name]: value }
    }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [name]: value }
    }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If saving profile settings and password is provided, validate it
    if (activeTab === 'profile' && isEditingProfile && password) {
      if (password !== confirmPassword) {
        setMessage({ text: 'Passwords do not match!', type: 'error' });
        return;
      }
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload = { ...formData };
      if (activeTab === 'profile' && password) {
        payload.profile = {
          ...payload.profile,
          adminPassword: password
        };
      }

      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save settings');
      
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
      setIsEditingProfile(false);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Error saving settings.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#fafbfc] font-sans text-slate-800">
        <AdminSidebar />
        <main className="flex-1 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6247df]"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fafbfc] font-sans text-slate-800">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1c1c28] mb-1">
                {isAdmin ? 'Academy Settings' : 'Teacher Profile Settings'}
              </h2>
              <p className="text-slate-500 font-medium">
                {isAdmin ? 'Manage profile details and public contact information.' : 'Manage your profile details and security settings.'}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[#6247df] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-900/20 hover:bg-[#5236cc] hover:shadow-xl hover:shadow-purple-900/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave size={18} />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-semibold text-sm shadow-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' && <FiCheckCircle size={18} />}
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200 pb-px">
            {isAdmin && (
              <button
                onClick={() => setActiveTab('footer')}
                className={`px-5 py-3 font-bold text-sm border-b-2 transition-all ${
                  activeTab === 'footer' ? 'border-[#6247df] text-[#6247df]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Contact & Footer Links
              </button>
            )}
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-5 py-3 font-bold text-sm border-b-2 transition-all ${
                activeTab === 'profile' ? 'border-[#6247df] text-[#6247df]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Profile Settings
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-50 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              
              {isAdmin && activeTab === 'footer' && (
                <div className="animate-[slideUp_0.2s_ease-out]">
                  <h3 className="text-xl font-bold text-[#1c1c28] mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <FiPhone className="text-[#6247df]" /> Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-[#1c1c28] mb-2">Phone Number</label>
                      <div className="relative">
                        <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          name="phone"
                          value={formData.contactInfo.phone}
                          onChange={handleContactChange}
                          placeholder="+1 234 567 890"
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1c1c28] mb-2">Public Email</label>
                      <div className="relative">
                        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="email"
                          name="email"
                          value={formData.contactInfo.email}
                          onChange={handleContactChange}
                          placeholder="hello@glosmartacademy.com"
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#1c1c28] mb-2">Academy Address</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                        <textarea
                          name="address"
                          value={formData.contactInfo.address}
                          onChange={handleContactChange}
                          placeholder="123 Art Avenue..."
                          rows={2}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#1c1c28] mb-5 pb-2 border-b border-slate-100 flex items-center gap-2 mt-10">
                    <FiFacebook className="text-[#6247df]" /> Social Media Links
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#1c1c28] mb-2">Facebook URL</label>
                      <div className="relative">
                        <FiFacebook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="url"
                          name="facebook"
                          value={formData.socialLinks.facebook}
                          onChange={handleSocialChange}
                          placeholder="https://facebook.com/..."
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1c1c28] mb-2">Instagram URL</label>
                      <div className="relative">
                        <FiInstagram className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="url"
                          name="instagram"
                          value={formData.socialLinks.instagram}
                          onChange={handleSocialChange}
                          placeholder="https://instagram.com/..."
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1c1c28] mb-2">Twitter / X URL</label>
                      <div className="relative">
                        <FiTwitter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="url"
                          name="twitter"
                          value={formData.socialLinks.twitter}
                          onChange={handleSocialChange}
                          placeholder="https://twitter.com/..."
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1c1c28] mb-2">YouTube URL</label>
                      <div className="relative">
                        <FiYoutube className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="url"
                          name="youtube"
                          value={formData.socialLinks.youtube}
                          onChange={handleSocialChange}
                          placeholder="https://youtube.com/..."
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="animate-[slideUp_0.2s_ease-out]">
                  <h3 className="text-xl font-bold text-[#1c1c28] mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <FiUser className="text-[#6247df]" /> {isAdmin ? 'Admin Profile' : 'Tutor Profile'}
                  </h3>
                  
                  <div className="flex flex-col gap-6 w-full">
                    {/* First Row: Name, Email, Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#1c1c28] mb-2">{isAdmin ? 'Admin Name' : 'Tutor Name'}</label>
                        <input
                          type="text"
                          name="adminName"
                          value={formData.profile.adminName}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                          placeholder={isAdmin ? "Admin Name" : "Tutor Name"}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#1c1c28] mb-2">{isAdmin ? 'Admin Account Email' : 'Tutor Email'}</label>
                        <input
                          type="email"
                          name="adminEmail"
                          value={formData.profile.adminEmail}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                          placeholder={isAdmin ? "admin@glosmart.com" : "tutor@glosmart.com"}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#1c1c28] mb-2">{isAdmin ? 'Admin Phone Number' : 'Tutor Phone'}</label>
                        <input
                          type="text"
                          name="adminPhone"
                          value={formData.profile.adminPhone || ''}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                          placeholder="Enter Phone Number"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Second Row: Password & Confirm Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                      <div>
                        <label className="block text-sm font-bold text-[#1c1c28] mb-2">New Password</label>
                        <div className="relative">
                          <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="password"
                            value={isEditingProfile ? password : '••••••••'}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={!isEditingProfile}
                            placeholder="Enter New Password"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium disabled:bg-slate-50 disabled:text-slate-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#1c1c28] mb-2">Confirm Password</label>
                        <div className="relative">
                          <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input
                            type="password"
                            value={isEditingProfile ? confirmPassword : '••••••••'}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={!isEditingProfile}
                            placeholder="Confirm New Password"
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium disabled:bg-slate-50 disabled:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Edit Option in the below */}
                    <div className="mt-4 border-t border-slate-100 pt-6 flex justify-start">
                      {!isEditingProfile ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="px-6 py-2.5 bg-[#6247df] text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#5236cc] hover:shadow-lg hover:shadow-purple-900/20 transition-all"
                        >
                          <FiEdit size={16} /> Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-[#6247df] text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#5236cc] hover:shadow-lg hover:shadow-purple-900/20 transition-all"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingProfile(false);
                              setPassword('');
                              setConfirmPassword('');
                              fetchSettings(); // Revert any changes
                            }}
                            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminSettingsPage;


