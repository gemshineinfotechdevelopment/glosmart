import React, { useState } from 'react';
import { 
  FiGrid, FiDownload, FiPlus,
  FiBriefcase, FiClock, FiCreditCard, FiFilter,
  FiChevronLeft, FiChevronRight, FiEdit3, FiRefreshCw
} from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface PaymentRow {
  invoiceNo: string;
  studentName: string;
  avatar: string;
  course: string;
  amount: string;
  mode: string;
  status: 'Successful' | 'Pending' | 'Failed';
}

export const FeesPayments: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Successful' | 'Failed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const payments: PaymentRow[] = [
    {
      invoiceNo: '#INV-9021',
      studentName: 'Ethan Thompson',
      avatar: 'https://i.pravatar.cc/150?img=33',
      course: 'Oil Painting 101',
      amount: '₹120.00',
      mode: 'UPI',
      status: 'Successful'
    },
    {
      invoiceNo: '#INV-9020',
      studentName: 'Lily Rodrigùez',
      avatar: 'https://i.pravatar.cc/150?img=45',
      course: 'Digital Illustration',
      amount: '₹250.00',
      mode: 'Cash',
      status: 'Pending'
    },
    {
      invoiceNo: '#INV-9019',
      studentName: 'Marcùs Cêen',
      avatar: 'https://i.pravatar.cc/150?img=12',
      course: 'Sculpting Basics',
      amount: '₹180.00',
      mode: 'UPI',
      status: 'Failed'
    },
    {
      invoiceNo: '#INV-9018',
      studentName: 'Sopêla Wrigêt',
      avatar: 'https://i.pravatar.cc/150?img=10',
      course: 'Watercolor Mastery',
      amount: '₹120.00',
      mode: 'UPI',
      status: 'Successful'
    }
  ];

  const filteredPayments = payments.filter(payment => {
    // Filter by tab
    if (activeFilter !== 'All' && payment.status !== activeFilter) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payment.studentName.toLowerCase().includes(query) ||
        payment.invoiceNo.toLowerCase().includes(query) ||
        payment.course.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#f8f9fd] font-sans text-slate-800">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 max-w-7xl mx-auto w-full box-border">
        
        {/* Top Search Bar */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg className="w-4.5 h-4.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search invoices, students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-[500px] pl-11 pr-5 py-3.5 bg-[#f0f0fb]/90 border border-transparent rounded-2xl outline-none text-slate-700 text-sm focus:bg-white focus:border-purple-200 transition-all placeholder:text-slate-400/80 font-semibold"
          />
        </div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-[#1c1c28] tracking-tight">Fees & Payments</h2>
            <p className="text-slate-500 font-semibold text-sm mt-1">Manage tuition fees, track collections and generate student invoices.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="bg-[#f0effb] text-[#6247df] border-none px-5 py-3.5 rounded-xl font-bold text-xs hover:bg-[#e4e1f7] transition-all cursor-pointer flex items-center gap-2">
              <FiDownload size={14} className="stroke-[2.5]" /> Download PDF
            </button>
            <button className="bg-[#6247df] text-white border-none px-5 py-3.5 rounded-xl font-bold text-xs hover:bg-[#5035c9] transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-purple-900/15">
              <FiPlus size={14} className="stroke-[2.5]" /> Generate Invoice
            </button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Collection */}
          <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-50 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-2xl bg-[#eef2ff] text-[#6247df] flex items-center justify-center shrink-0">
                <FiBriefcase size={20} className="stroke-[2.5]" />
              </div>
              <span className="text-[#0284c7] text-[11px] font-extrabold bg-[#e0f2fe] px-2.5 py-1.5 rounded-lg">+12% vs last mo</span>
            </div>
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Collection</p>
              <h3 className="text-3xl font-black text-[#1c1c28] mt-1.5">₹42,850</h3>
            </div>
            <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden mt-1 relative">
              <div className="bg-[#6247df] w-[75%] h-full rounded-full"></div>
            </div>
          </div>

          {/* Card 2: Pending Fees */}
          <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-50 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-2xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center shrink-0">
                <FiClock size={20} className="stroke-[2.5]" />
              </div>
              <span className="text-[#ea580c] text-[11px] font-extrabold bg-[#ffedd5] px-2.5 py-1.5 rounded-lg">14 Overdue</span>
            </div>
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Pending Fees</p>
              <h3 className="text-3xl font-black text-[#ea580c] mt-1.5">₹8,240.00</h3>
            </div>
            <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden mt-1 relative">
              <div className="bg-[#ea580c] w-[35%] h-full rounded-full"></div>
            </div>
          </div>

          {/* Card 3: Today's Collection */}
          <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-50 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-11 h-11 rounded-2xl bg-[#ecfeff] text-[#0891b2] flex items-center justify-center shrink-0">
                <FiCreditCard size={20} className="stroke-[2.5]" />
              </div>
              <span className="text-[#0891b2] text-[11px] font-extrabold bg-[#cffafe] px-2.5 py-1.5 rounded-lg">24 Payments</span>
            </div>
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Today's Collection</p>
              <h3 className="text-3xl font-black text-[#0891b2] mt-1.5">₹1,150.00</h3>
            </div>
            <div className="flex items-center gap-2.5 mt-1.5">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/150?img=11" className="w-6.5 h-6.5 rounded-full border-2 border-white object-cover" alt="Student" />
                <img src="https://i.pravatar.cc/150?img=22" className="w-6.5 h-6.5 rounded-full border-2 border-white object-cover" alt="Student" />
                <img src="https://i.pravatar.cc/150?img=33" className="w-6.5 h-6.5 rounded-full border-2 border-white object-cover" alt="Student" />
              </div>
              <span className="text-xs text-slate-400 font-semibold">+21 others</span>
            </div>
          </div>
        </div>

        {/* Recent Payments Section */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-slate-100 overflow-hidden flex flex-col">
          {/* Card Header controls */}
          <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-black text-[#1c1c28]">Recent Payments</h3>
              <div className="flex bg-[#f1f5f9] p-1 rounded-xl">
                {(['All', 'Successful', 'Failed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-4 py-2 border-none rounded-lg font-bold text-xs cursor-pointer transition-all ${
                      activeFilter === tab
                        ? 'bg-white text-[#6247df] shadow-sm'
                        : 'bg-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="bg-transparent border border-slate-200 text-slate-400 hover:text-slate-600 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all">
                <FiFilter size={16} />
              </button>
              <button className="bg-transparent border border-slate-200 text-slate-400 hover:text-slate-600 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all">
                <FiGrid size={16} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="bg-[#fafbfc] border-b border-slate-50 text-[11px] font-extrabold text-slate-400 tracking-wider">
                  <th className="py-4 px-6">INVOICE NO</th>
                  <th className="py-4 px-6">STUDENT NAME</th>
                  <th className="py-4 px-6">COURSE</th>
                  <th className="py-4 px-6">AMOUNT</th>
                  <th className="py-4 px-6">MODE</th>
                  <th className="py-4 px-6">STATUS</th>
                  <th className="py-4 px-6 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.map((row) => (
                  <tr key={row.invoiceNo} className="hover:bg-slate-50/50 transition-colors text-[14px]">
                    <td className="py-4 px-6 font-bold text-slate-400">{row.invoiceNo}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={row.avatar} className="w-8 h-8 rounded-full object-cover shrink-0" alt={row.studentName} />
                        <span className="font-extrabold text-[#1c1c28]">{row.studentName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-500">{row.course}</td>
                    <td className="py-4 px-6 font-extrabold text-[#1c1c28]">{row.amount}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-bold text-slate-400">
                        {row.mode === 'UPI' ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>UPI</span>
                          </>
                        ) : (
                          <>
                            <FiCreditCard size={14} />
                            <span>Cash</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-[11px] font-extrabold ${
                        row.status === 'Successful' ? 'bg-[#f0fdf4] text-green-600' :
                        row.status === 'Pending' ? 'bg-[#fffbeb] text-amber-500' :
                        'bg-[#fef2f2] text-red-500'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.status === 'Successful' && (
                        <button className="bg-transparent border-none text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                          <FiDownload size={16} />
                        </button>
                      )}
                      {row.status === 'Pending' && (
                        <button className="bg-transparent border-none text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                          <FiEdit3 size={16} />
                        </button>
                      )}
                      {row.status === 'Failed' && (
                        <button className="bg-transparent border-none text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                          <FiRefreshCw size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-slate-400 font-semibold">Showing 4 of 240 payments</span>
            <div className="flex items-center gap-1.5">
              <button className="bg-transparent border border-slate-200 text-slate-400 w-8 h-8 rounded-lg flex items-center justify-center cursor-not-allowed">
                <FiChevronLeft size={16} />
              </button>
              <button className="bg-[#6247df] border-none text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer shadow-md shadow-purple-900/10">
                1
              </button>
              <button className="bg-white border border-slate-200 text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs hover:bg-slate-50 cursor-pointer transition-all">
                2
              </button>
              <button className="bg-white border border-slate-200 text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs hover:bg-slate-50 cursor-pointer transition-all">
                3
              </button>
              <button className="bg-white border border-slate-200 text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Statistics and Automation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
          {/* Payment Modes Progress Bars */}
          <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-50 flex flex-col gap-6">
            <h3 className="text-lg font-black text-[#1c1c28]">Payment Modes</h3>
            <div className="flex flex-col gap-5">
              {/* Mode 1: UPI */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-500">UPI Payments</span>
                  <span className="font-extrabold text-[#1c1c28]">65%</span>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#6247df] w-[65%] h-full rounded-full"></div>
                </div>
              </div>

              {/* Mode 2: Cash */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-500">Casê / Offline</span>
                  <span className="font-extrabold text-[#1c1c28]">25%</span>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#ea580c] w-[25%] h-full rounded-full"></div>
                </div>
              </div>

              {/* Mode 3: Bank Transfer */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-500">Bank Transfer</span>
                  <span className="font-extrabold text-[#1c1c28]">10%</span>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0891b2] w-[10%] h-full rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Automate Billing CTA Box */}
          <div className="bg-gradient-to-br from-[#7c4dff] to-[#6200ee] rounded-[24px] p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between gap-6 shrink-0">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col gap-3 relative z-10">
              <h3 className="font-fredoka text-2xl font-bold tracking-tight">Automate Billing</h3>
              <p className="text-slate-100/90 text-sm leading-relaxed max-w-sm">Schedule monthly tuition invoices for all enrolled students automatically.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full">
              <button className="flex-1 bg-white hover:bg-slate-50 text-[#6247df] border-none py-3.5 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-md">
                Enable Aùto-Pay
              </button>
              <button className="flex-1 bg-transparent hover:bg-white/10 text-white border-2 border-white py-3 rounded-xl font-bold text-xs cursor-pointer transition-all">
                Configùre Rùles
              </button>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
};

export default FeesPayments;
