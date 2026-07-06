import React from 'react';
import {
  FiSearch, FiCalendar, FiUpload, FiUserPlus,
  FiUsers, FiCreditCard, FiClock,
  FiEye, FiEdit2, FiFileText, FiChevronLeft, FiChevronRight, FiChevronRight as FiBreadcrumbRight
} from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

const BatchDetails: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#fcfdff] font-sans text-slate-800">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <FiCalendar size={20} />
            </button>

            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1c1c28] leading-tight">Admin User</p>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider">DIRECTOR</p>
              </div>
              <img
                src="https://i.pravatar.cc/150?img=11"
                alt="Admin Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Breadcrumb & Actions Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Link to="/admin/students" className="text-slate-500 hover:text-slate-700">Students</Link>
              <FiBreadcrumbRight className="text-slate-400" size={14} />
              <span className="text-slate-500">Pencil Drawing</span>
              <FiBreadcrumbRight className="text-slate-400" size={14} />
              <span className="text-[#6247df] font-bold">Batch A</span>
            </div>
            <h2 className="text-[22px] font-bold text-[#1c1c28]">Pencil Drawing – Batch A</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Tabs */}
            <div className="bg-slate-100/80 p-1 rounded-xl flex items-center shadow-inner">
              <button className="bg-white text-[#6247df] px-6 py-2 rounded-lg font-bold text-sm shadow-[0_2px_10px_rgb(0,0,0,0.04)]">
                All
              </button>
              <button className="text-slate-500 hover:text-slate-700 px-6 py-2 rounded-lg font-bold text-sm transition-colors">
                Paid
              </button>
              <button className="text-slate-500 hover:text-slate-700 px-6 py-2 rounded-lg font-bold text-sm transition-colors">
                Pending
              </button>
            </div>

            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <FiUpload size={16} /> Export
            </button>

            <button className="flex items-center gap-2 bg-[#6247df] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#5035c9] transition-colors">
              <FiUserPlus size={16} /> Add Student
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#f3f0ff] text-[#6247df] flex items-center justify-center shrink-0">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">TOTAL STUDENTS</p>
              <h3 className="text-2xl font-black text-[#1c1c28]">18</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#e6f8f8] text-[#108c9f] flex items-center justify-center shrink-0">
              <MdCurrencyRupee size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">FEES PAID</p>
              <h3 className="text-2xl font-black text-[#1c1c28]">₹2,160</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#fcf2ea] text-[#b67323] flex items-center justify-center shrink-0">
              <FiCreditCard size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">PENDING FEES</p>
              <h3 className="text-2xl font-black text-[#1c1c28]">₹540</h3>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#fef1f1] text-[#ef4444] flex items-center justify-center shrink-0">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">BATCH ENDS IN</p>
              <h3 className="text-2xl font-black text-[#ef4444]">12 Days</h3>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500">
                  <th className="py-5 px-6 font-bold w-16">Profile</th>
                  <th className="py-5 px-4 font-bold">Name</th>
                  <th className="py-5 px-4 font-bold">Age/Gender</th>
                  <th className="py-5 px-4 font-bold">Joining Date</th>
                  <th className="py-5 px-4 font-bold">Fee Status</th>
                  <th className="py-5 px-4 font-bold">Batch End</th>
                  <th className="py-5 px-4 font-bold">Remaining</th>
                  <th className="py-5 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <img src="https://i.pravatar.cc/150?img=1" alt="Student" className="w-10 h-10 rounded-full object-cover" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-[#1c1c28] text-sm">Mia Thompson</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">+1(555) 012-3456</div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">14 / Female</td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">
                    15 Mar<br />2024
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-[#e6f8f8] text-[#108c9f] text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider">
                      PAID
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">
                    28 Aug<br />2026
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#6247df] w-full h-full rounded-full"></div>
                      </div>
                      <span className="text-[10px] font-bold text-[#6247df] leading-tight">12<br />Days</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button className="hover:text-slate-700 transition-colors"><FiEye size={18} /></button>
                      <button className="hover:text-slate-700 transition-colors"><FiEdit2 size={18} /></button>
                      <button className="hover:text-slate-700 transition-colors"><FiFileText size={18} /></button>
                    </div>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <img src="https://i.pravatar.cc/150?img=3" alt="Student" className="w-10 h-10 rounded-full object-cover" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-[#1c1c28] text-sm">Lucas Bennett</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">+1(555) 098-7654</div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">16 / Male</td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">
                    12 Apr<br />2024
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-[#fcf2ea] text-[#b67323] text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider">
                      PARTIAL
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">
                    28 Aug<br />2026
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#6247df] w-[80%] h-full rounded-full"></div>
                      </div>
                      <span className="text-[10px] font-bold text-[#6247df] leading-tight">12<br />Days</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button className="hover:text-slate-700 transition-colors"><FiEye size={18} /></button>
                      <button className="hover:text-slate-700 transition-colors"><FiEdit2 size={18} /></button>
                      <button className="hover:text-slate-700 transition-colors"><FiFileText size={18} /></button>
                    </div>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <img src="https://i.pravatar.cc/150?img=5" alt="Student" className="w-10 h-10 rounded-full object-cover" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-[#1c1c28] text-sm">Sophia Rivera</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">+1(555) 234-5678</div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">13 / Female</td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">
                    20 Feb<br />2024
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-[#fef1f1] text-[#ef4444] text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider">
                      PENDING
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">
                    28 Aug<br />2026
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#6247df] w-1/2 h-full rounded-full"></div>
                      </div>
                      <span className="text-[10px] font-bold text-[#6247df] leading-tight">12<br />Days</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button className="hover:text-slate-700 transition-colors"><FiEye size={18} /></button>
                      <button className="hover:text-slate-700 transition-colors"><FiEdit2 size={18} /></button>
                      <button className="hover:text-slate-700 transition-colors"><FiFileText size={18} /></button>
                    </div>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <img src="https://i.pravatar.cc/150?img=8" alt="Student" className="w-10 h-10 rounded-full object-cover" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-[#1c1c28] text-sm">Ethan Walker</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">+1(555) 345-6789</div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">17 / Male</td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">
                    05 May<br />2024
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-[#e6f8f8] text-[#108c9f] text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider">
                      PAID
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">
                    28 Aug<br />2026
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#6247df] w-[90%] h-full rounded-full"></div>
                      </div>
                      <span className="text-[10px] font-bold text-[#6247df] leading-tight">12<br />Days</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button className="hover:text-slate-700 transition-colors"><FiEye size={18} /></button>
                      <button className="hover:text-slate-700 transition-colors"><FiEdit2 size={18} /></button>
                      <button className="hover:text-slate-700 transition-colors"><FiFileText size={18} /></button>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm font-medium text-slate-500">
              Showing 4 of 18 students
            </div>

            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                <FiChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#6247df] text-white font-bold text-sm shadow-md shadow-purple-200">
                1
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
                2
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
                3
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default BatchDetails;
