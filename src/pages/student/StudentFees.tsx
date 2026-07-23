import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { FiDownload, FiCheckCircle, FiAlertCircle, FiCreditCard } from 'react-icons/fi';

interface ReceiptRow {
  invoiceNo: string;
  item: string;
  amount: string;
  date: string;
  method: string;
  status: 'Successful' | 'Pending' | 'Failed';
}

const StudentFees: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshEnrollment } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [studentId, setStudentId] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [pendingEnrollment, setPendingEnrollment] = useState<any>(location.state?.pendingEnrollment || null);
  const [pendingBatch, setPendingBatch] = useState<any>(location.state?.pendingBatch || null);
  const [paying, setPaying] = useState(false);

  const [studentName, setStudentName] = useState('Student User');
  const [studentGrade, setStudentGrade] = useState('5th Grade');
  const [studentAvatar, setStudentAvatar] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80');
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);

  const defaultReceipts: ReceiptRow[] = [
    {
      invoiceNo: '#INV-9883',
      item: 'Advanced Oil Painting - Semester 2 Fee',
      amount: '₹5,000',
      date: 'Oct 10, 2023',
      method: 'UPI',
      status: 'Successful'
    },
    {
      invoiceNo: '#INV-9612',
      item: 'Sculpting Material Kit',
      amount: '₹1,500',
      date: 'Sep 15, 2023',
      method: 'UPI',
      status: 'Successful'
    },
    {
      invoiceNo: '#INV-9521',
      item: 'Anatomy Sketchbook & Charcoal Supplies',
      amount: '₹800',
      date: 'Sep 01, 2023',
      method: 'UPI',
      status: 'Successful'
    },
    {
      invoiceNo: '#INV-9411',
      item: 'Digital Media Lab Access Fee',
      amount: '₹5,500',
      date: 'Aug 20, 2023',
      method: 'Bank Transfer',
      status: 'Successful'
    }
  ];

  useEffect(() => {
    const profileId = user?.profileId || 'first';
    // 1. Fetch student
    fetch(`${API_BASE_URL}/api/students/${profileId}`)
      .then(res => res.json())
      .then(studentData => {
        if (studentData) {
          setStudentId(studentData._id);
          setEnrolledCourses(studentData.enrolledCourses || []);
          const name = studentData.name || 'Student User';
          setStudentName(name);
          setStudentGrade(studentData.grade || '5th Grade');
          setStudentAvatar(studentData.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80');

          // 2. Fetch payments
          fetch(`${API_BASE_URL}/api/payments`)
            .then(res => res.json())
            .then(async (paymentsData) => {
              const filtered = paymentsData.filter((p: any) => p.studentName === name);
              
              if (filtered.length > 0) {
                setReceipts(filtered.map((p: any) => ({
                  invoiceNo: p.invoiceNo,
                  item: p.course || 'Semester Fee',
                  amount: p.amount,
                  date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  method: p.mode || 'UPI',
                  status: p.status as any
                })));
              } else if (name === 'Sarah Jenkins') {
                setReceipts(defaultReceipts);
                // Seed database payments for this student
                for (const receipt of defaultReceipts) {
                  try {
                    await fetch(`${API_BASE_URL}/api/payments`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        invoiceNo: receipt.invoiceNo,
                        studentName: name,
                        avatar: studentData.avatar,
                        course: receipt.item,
                        amount: receipt.amount,
                        mode: receipt.method,
                        status: receipt.status
                      })
                    });
                  } catch (e) {
                    console.error('Error seeding payment record:', e);
                  }
                }
              } else {
                setReceipts([]);
              }
            })
            .catch(err => console.error('Error fetching payments:', err));
        }
      })
      .catch(err => console.error('Error loading student:', err));
  }, [user]);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Payment Transaction & Enrollment Completion
  const handlePayment = async () => {
    if (!pendingEnrollment || !pendingBatch || !studentId) return;

    setPaying(true);

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setPaying(false);
        return;
      }

      // 2. Fetch Razorpay Key ID from backend
      const keyRes = await fetch(`${API_BASE_URL}/api/payments/razorpay-key`);
      if (!keyRes.ok) throw new Error('Failed to retrieve Razorpay Key ID');
      const { keyId } = await keyRes.json();

      const feeNum = pendingBatch?.batchFee || pendingEnrollment?.courseFee || 4500;
      const amountStr = `₹${feeNum.toLocaleString('en-IN')}`;
      const description = pendingBatch 
        ? `${pendingEnrollment.courseName} - Batch: ${pendingBatch.batchName}`
        : `${pendingEnrollment.courseName} - Course Enrollment Fee`;

      // 3. Create Razorpay order on backend
      const orderRes = await fetch(`${API_BASE_URL}/api/payments/razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: feeNum })
      });
      if (!orderRes.ok) throw new Error('Failed to initiate Razorpay order');
      const orderData = await orderRes.json();

      const invoiceNo = `#INV-${Math.floor(1000 + Math.random() * 9000)}`;

      // 4. Construct enrolled course object to pass to verify endpoint
      const newEnrolled = {
        courseId: pendingEnrollment._id,
        courseName: pendingEnrollment.courseName,
        courseCode: pendingEnrollment.courseCode,
        description: pendingEnrollment.description,
        skillLevel: pendingEnrollment.skillLevel,
        thumbnailImage: pendingEnrollment.thumbnailImage,
        progress: 0,
        instructor: pendingBatch?.instructor || 'TBD (Assigning)',
        nextSession: pendingBatch?.days 
          ? `${pendingBatch.days.join(', ')} • ${pendingBatch.startTime} - ${pendingBatch.endTime}`
          : 'Schedule TBD',
        lastAccessed: 'Just Enrolled',
        batchId: pendingBatch?._id || '',
        batchName: pendingBatch?.batchName || ''
      };

      const updatedCourses = [...enrolledCourses, newEnrolled];

      const updatePayload: any = { enrolledCourses: updatedCourses };
      if (pendingBatch) {
        updatePayload.batchId = pendingBatch._id;
        updatePayload.batch = pendingBatch.batchName;
        updatePayload.courseId = pendingEnrollment._id;
        updatePayload.course = pendingEnrollment.courseName;
        updatePayload.teacher = pendingBatch.instructor || 'TBD (Assigning)';
        updatePayload.schedule = pendingBatch.days 
          ? `${pendingBatch.days.join(', ')} • ${pendingBatch.startTime} - ${pendingBatch.endTime}`
          : pendingBatch.batchName;
      }

      // 5. Open Razorpay checkout popup
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Glosmart Academy',
        description: description,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            setPaying(true);
            // Call verify API
            const verifyRes = await fetch(`${API_BASE_URL}/api/payments/razorpay-verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                studentId,
                newEnrolledCourse: newEnrolled,
                updatePayload,
                paymentDetails: {
                  invoiceNo,
                  studentName,
                  avatar: studentAvatar,
                  course: description,
                  amount: amountStr,
                  mode: 'Razorpay'
                }
              })
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json();
              throw new Error(errData.message || 'Verification failed');
            }

            // Verification successful! Update local client state
            setEnrolledCourses(updatedCourses);
            await refreshEnrollment();

            const newReceipt: ReceiptRow = {
              invoiceNo,
              item: description,
              amount: amountStr,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              method: 'Razorpay',
              status: 'Successful'
            };
            setReceipts((prev) => [newReceipt, ...prev]);

            setToastMessage(`Payment of ${amountStr} successful! Enrolled in ${pendingEnrollment.courseName} (${pendingBatch.batchName}).`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);

            setPendingEnrollment(null);
            setPendingBatch(null);
            window.history.replaceState({}, document.title);
          } catch (err: any) {
            console.error('Error verifying payment:', err);
            alert(`Payment verification failed: ${err.message || err}`);
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: studentName,
          email: user?.email || '',
        },
        theme: {
          color: '#6247df',
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Error completing payment:', err);
      alert('There was an issue processing your payment. Please try again.');
      setPaying(false);
    }
  };

  // Handle PDF Download Toast trigger
  const triggerPdfDownload = (invoice: string) => {
    setToastMessage(`Downloading invoice PDF for ${invoice}...`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div className="flex flex-col relative overflow-x-hidden pb-12 w-full min-w-0">
        
        {/* Top Header */}
        <header className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 sm:py-6 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Fees & Payments</h1>
            <p className="text-slate-500 text-[13px] sm:text-[14px] mt-0.5">View your billing history and download invoice receipts</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold text-slate-900 leading-none">{studentName}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Student • {studentGrade}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#6247df] text-white flex items-center justify-center font-bold text-lg border border-slate-200 shadow-sm cursor-pointer shrink-0" onClick={() => navigate('/student/profile')}>{studentName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* Content Container */}
        <div className="px-4 sm:px-6 lg:px-10 mt-6 sm:mt-8 space-y-8 flex-1">
          
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-slate-700/50 animate-bounce">
              <div className="p-1 bg-[#4700b3] text-white rounded-full">
                <FiCheckCircle size={16} />
              </div>
              <span className="font-semibold text-sm">{toastMessage}</span>
            </div>
          )}
          {/* Pending Enrollment Payment Alert */}
          {pendingEnrollment && (
            <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent rounded-[24px] border border-purple-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_12px_40px_rgba(71,0,179,0.04)] animate-fade-in text-left">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-[#4700b3]/10 text-[#4700b3] rounded-2xl shrink-0">
                  <FiAlertCircle size={28} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">
                    Enrollment Payment Required
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    {pendingEnrollment.courseName}
                  </h3>
                  {pendingBatch && (
                    <div className="mt-2 text-xs font-bold text-[#4700b3] bg-[#4700b3]/5 px-3.5 py-2 rounded-2xl w-fit flex flex-col gap-1 border border-purple-100">
                      <span>Selected Batch: {pendingBatch.batchName}</span>
                      <span className="text-slate-500 font-medium">
                        Schedule: {pendingBatch.days ? pendingBatch.days.join(', ') : 'Days TBD'} • {pendingBatch.startTime && pendingBatch.endTime ? `${pendingBatch.startTime} - ${pendingBatch.endTime}` : 'Time TBD'}
                      </span>
                      {pendingBatch.instructor && <span className="text-slate-500 font-medium">Instructor: {pendingBatch.instructor}</span>}
                    </div>
                  )}
                  <p className="text-slate-500 text-xs mt-3 max-w-[500px]">
                    To complete your enrollment and gain instant access to class lectures, assignments, and materials, please pay the course fee.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
                <div className="text-center sm:text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrollment Fee</p>
                  <h2 className="text-2xl font-black text-slate-950">
                    ₹{(pendingBatch?.batchFee || pendingEnrollment?.courseFee || 4500).toLocaleString('en-IN')}
                  </h2>
                </div>
                
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full sm:w-auto bg-[#4700b3] hover:bg-[#3d0099] disabled:bg-purple-300 text-white font-extrabold px-6 py-3.5 rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-2 text-xs shadow-md shadow-purple-900/20"
                >
                  {paying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCreditCard size={14} /> Pay Fee & Enroll
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setPendingEnrollment(null);
                    setPendingBatch(null);
                  }}
                  disabled={paying}
                  className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold px-4 py-3.5 rounded-xl border border-slate-200 cursor-pointer text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Receipt History Table */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight text-left">Receipt History</h3>
              <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {receipts.length} Payments Recorded
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider">
                    <th className="py-4 px-6">INVOICE NO</th>
                    <th className="py-4 px-6">ITEM / DESCRIPTION</th>
                    <th className="py-4 px-6">AMOUNT</th>
                    <th className="py-4 px-6">DATE</th>
                    <th className="py-4 px-6">METHOD</th>
                    <th className="py-4 px-6">STATUS</th>
                    <th className="py-4 px-6 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-sans text-xs">
                  {receipts.map((row) => (
                    <tr key={row.invoiceNo} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#4700b3]">{row.invoiceNo}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">{row.item}</td>
                      <td className="py-4 px-6 font-black text-slate-900">{row.amount}</td>
                      <td className="py-4 px-6 font-semibold text-slate-500">{row.date}</td>
                      <td className="py-4 px-6 font-bold text-slate-400">{row.method}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => triggerPdfDownload(row.invoiceNo)}
                          className="bg-transparent border-none text-[#4700b3] hover:text-[#3d0099] cursor-pointer p-1.5 flex items-center gap-1 mx-auto font-bold text-xs"
                        >
                          <FiDownload size={14} /> Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

    </div>
  );
};

export default StudentFees;
