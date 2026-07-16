import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiCheckCircle, 
  FiUploadCloud, 
  FiEye, 
  FiAlertCircle, 
  FiCheck, 
  FiX,
  FiFileText,
  FiClipboard,
  FiAward
} from 'react-icons/fi';

interface PendingAssignment {
  id: string;
  title: string;
  course: string;
  instructor: string;
  dueDate: string;
  dueInDays: number;
}

interface SubmittedAssignment {
  id: string;
  title: string;
  course: string;
  submittedDate: string;
  status: 'Awaiting Grade' | 'Graded';
  grade?: string;
  comments?: string;
  fileName?: string;
}

/*
interface Certificate {
  id: string;
  title: string;
  completedDate: string;
  credentialId: string;
}
*/

const StudentAssignments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('Student User');
  const [studentGrade, setStudentGrade] = useState('5th Grade');
  const [studentAvatar, setStudentAvatar] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80');
  // const [pendingCount, setPendingCount] = useState(4);
  // const [completedCount, setCompletedCount] = useState(2);
  // const gpa = "3.8";
  
  const [pendingAssignments, setPendingAssignments] = useState<PendingAssignment[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<SubmittedAssignment[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);

  // Fetch student assignments on mount
  useEffect(() => {
    const profileId = user?.profileId || 'first';
    fetch(`http://localhost:5000/api/students/${profileId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStudentId(data._id);
          if (data.name) setStudentName(data.name);
          if (data.grade) setStudentGrade(data.grade);
          if (data.avatar) setStudentAvatar(data.avatar);

          if (data.assignments) {
            setAllAssignments(data.assignments);
            
            // Map pending
            const pending = data.assignments.filter((a: any) => a.status === 'Pending').map((a: any) => ({
              id: a.id || a._id,
              title: a.title,
              course: a.course,
              instructor: 'TBD',
              dueDate: a.dueDate || 'No Due Date',
              dueInDays: 5
            }));
            setPendingAssignments(pending);
            // setPendingCount(pending.length);

            // Map submitted
            const submitted = data.assignments.filter((a: any) => a.status === 'Submitted' || a.status === 'Graded').map((a: any) => ({
              id: a.id || a._id,
              title: a.title,
              course: a.course,
              submittedDate: a.submittedAt || 'Just Now',
              status: a.status === 'Graded' ? 'Graded' : 'Awaiting Grade',
              grade: a.grade,
              comments: a.description,
              fileName: a.submittedFile || 'document.pdf'
            }));
            setSubmittedAssignments(submitted);
            // setCompletedCount(submitted.length);
          }
        }
      })
      .catch(err => console.error('Error fetching assignments:', err));
  }, [user]);

  // Certificates list commented out
  /*
  const certificates: Certificate[] = [
    {
      id: 'CERT-01',
      title: 'Advanced Oil Painting',
      completedDate: 'Completed Oct 12, 2023',
      credentialId: 'GS-CERT-99812'
    },
    {
      id: 'CERT-02',
      title: 'Digital Illustration 101',
      completedDate: 'Completed Aug 24, 2023',
      credentialId: 'GS-CERT-99120'
    },
    {
      id: 'CERT-03',
      title: 'Art History & Theory',
      completedDate: 'Completed June 15, 2023',
      credentialId: 'GS-CERT-98211'
    }
  ];
  */

  // Upload modal state
  const [selectedAssignment, setSelectedAssignment] = useState<PendingAssignment | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [comments, setComments] = useState('');
  
  // Submission details modal state
  const [viewingSubmission, setViewingSubmission] = useState<SubmittedAssignment | null>(null);

  // Toast notifications state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Share modal state commented out
  // const [sharingCert, setSharingCert] = useState<Certificate | null>(null);

  // File Drag-Drop triggers
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Submit file handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !uploadedFile) return;

    // Create a new submitted assignment
    const newSubmission: SubmittedAssignment = {
      id: selectedAssignment.id,
      title: selectedAssignment.title,
      course: selectedAssignment.course,
      submittedDate: `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'Awaiting Grade',
      fileName: uploadedFile.name,
      comments: comments
    };

    // Update allAssignments list for database PUT
    const updatedAllAssignments = allAssignments.map(a => {
      if ((a.id || a._id) === selectedAssignment.id) {
        return {
          ...a,
          status: 'Submitted',
          submittedFile: uploadedFile.name,
          submittedAt: newSubmission.submittedDate
        };
      }
      return a;
    });

    setAllAssignments(updatedAllAssignments);

    // Save to DB
    fetch(`http://localhost:5000/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments: updatedAllAssignments })
    })
      .then(res => {
        if (res.ok) {
          // Update state locally
          setSubmittedAssignments([newSubmission, ...submittedAssignments]);
          setPendingAssignments(pendingAssignments.filter(a => a.id !== selectedAssignment.id));
          // setPendingCount(prev => Math.max(0, prev - 1));
          // setCompletedCount(prev => prev + 1);

          // Close modal
          setIsUploadOpen(false);
          setSelectedAssignment(null);
          setUploadedFile(null);
          setComments('');

          // Trigger Toast
          setToastMessage(`Assignment "${newSubmission.title}" submitted successfully!`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        }
      })
      .catch(err => console.error('Error uploading assignment to database:', err));
  };

  /*
  const triggerDownload = (title: string) => {
    setToastMessage(`Downloading certificate PDF for "${title}"...`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };
  */

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] w-full font-sans text-slate-800">
      {/* Left Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden pb-12">
        
        {/* Top Header */}
        <header className="flex justify-between items-center px-6 lg:px-10 py-6 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assignments</h1>
            <p className="text-slate-500 text-[14px] mt-0.5">Submit coursework, check grades, and view earned certifications</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold text-slate-900 leading-none">{studentName}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Student • {studentGrade}</p>
            </div>
            <img 
              src={studentAvatar} 
              alt={studentName} 
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm cursor-pointer"
              onClick={() => navigate('/student/profile')}
            />
          </div>
        </header>

        {/* Outer Container */}
        <div className="px-6 lg:px-10 mt-6 space-y-6 flex-1">
          
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-slate-700/50 animate-bounce">
              <div className="p-1 bg-[#4700b3] text-white rounded-full">
                <FiCheck size={16} />
              </div>
              <span className="font-semibold text-sm">{toastMessage}</span>
            </div>
          )}

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Card 1: Pending */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending</p>
                <h2 className="text-3xl font-black text-slate-950 mt-1 tracking-tight">
                  {pendingAssignments.length.toString().padStart(2, '0')}
                </h2>
                <span className="text-[10px] text-amber-600 font-extrabold mt-1 block">Awaiting submission</span>
              </div>
              <div className="p-4 bg-purple-50 text-[#4700b3] rounded-2xl group-hover:bg-[#4700b3] group-hover:text-white transition-colors duration-300">
                <FiClipboard size={22} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Card 2: Submitted */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Submitted</p>
                <h2 className="text-3xl font-black text-slate-950 mt-1 tracking-tight">
                  {submittedAssignments.filter(s => s.status === 'Awaiting Grade').length.toString().padStart(2, '0')}
                </h2>
                <span className="text-[10px] text-[#4700b3] font-extrabold mt-1 block">Awaiting grade</span>
              </div>
              <div className="p-4 bg-purple-50 text-[#4700b3] rounded-2xl group-hover:bg-[#4700b3] group-hover:text-white transition-colors duration-300">
                <FiUploadCloud size={22} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Card 3: Graded */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Graded</p>
                <h2 className="text-3xl font-black text-slate-950 mt-1 tracking-tight">
                  {submittedAssignments.filter(s => s.status === 'Graded').length.toString().padStart(2, '0')}
                </h2>
                <span className="text-[10px] text-emerald-600 font-extrabold mt-1 block">Feedback ready</span>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <FiCheckCircle size={22} className="stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Section: Pending Assignments */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="w-1.5 h-6 bg-[#4700b3] rounded-full inline-block"></span>
                Pending Assignments
              </h2>
              <span className="bg-[#4700b3] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {pendingAssignments.length} Items
              </span>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                  <FiCheckCircle size={32} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">All caught up!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">You have no pending assignments. Check back later or explore your courses for new tasks.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingAssignments.map((assignment) => {
                  const isUrgent = assignment.dueInDays <= 3;
                  return (
                    <div 
                      key={assignment.id} 
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4">
                          <div className={`p-3 rounded-2xl h-12 w-12 flex items-center justify-center shrink-0 ${isUrgent ? 'bg-red-50 text-red-500' : 'bg-purple-50 text-[#4700b3]'}`}>
                            <FiFileText size={20} />
                          </div>
                          <div className="text-left">
                            <h3 className="font-extrabold text-slate-950 text-[15px] leading-snug pr-2">
                              {assignment.title}
                            </h3>
                            <p className="text-slate-400 text-[11px] font-bold mt-1 uppercase tracking-wider leading-none">
                              {assignment.course} • {assignment.instructor}
                            </p>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                          isUrgent ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-purple-50 text-[#4700b3] border border-purple-100'
                        }`}>
                          {isUrgent ? '⚠ Urgent' : `${assignment.dueInDays}d left`}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                          <FiAlertCircle size={14} /> Due {assignment.dueDate}
                        </span>
                        <button 
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setIsUploadOpen(true);
                          }}
                          className="bg-[#4700b3] hover:bg-[#3d0099] text-white py-2 px-4 rounded-xl font-bold text-[11px] flex items-center gap-1.5 border-none cursor-pointer transition-all shadow-sm shadow-purple-200"
                        >
                          <FiUploadCloud size={14} /> Submit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section: Submitted Assignments */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
                Submitted & Graded
              </h2>
              <span className="text-slate-400 text-xs font-semibold">
                {submittedAssignments.length} total submissions
              </span>
            </div>

            {submittedAssignments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <div className="mx-auto w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
                  <FiAward size={28} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">No submissions yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Once you submit an assignment, it will appear here with its grading status.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                        <th className="py-4 pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignment</th>
                        <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted</th>
                        <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-sans">
                      {submittedAssignments.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-6 text-left">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl shrink-0 ${sub.status === 'Graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-[#4700b3]'}`}>
                                <FiFileText size={16} />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{sub.title}</h4>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sub.course}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-semibold text-slate-500 text-left">
                            {sub.submittedDate}
                          </td>
                          <td className="py-4 text-left">
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                              sub.status === 'Graded' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-purple-50 text-[#4700b3] border border-purple-100'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Graded' ? 'bg-emerald-500' : 'bg-[#4700b3]'}`}></span>
                              {sub.status === 'Graded' ? `Graded (${sub.grade})` : 'Awaiting Grade'}
                            </span>
                          </td>
                          <td className="py-4 text-right pr-6">
                            <button 
                              onClick={() => setViewingSubmission(sub)}
                              className="text-[#4700b3] hover:text-[#3d0099] font-bold text-xs bg-transparent border-none cursor-pointer flex items-center gap-1 ml-auto"
                            >
                              <FiEye size={12} /> Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Modal: Upload Assignment */}
        {isUploadOpen && selectedAssignment && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 bg-[#4700b3] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiUploadCloud size={20} />
                  <h3 className="text-lg font-extrabold tracking-tight">Upload Assignment</h3>
                </div>
                <button 
                  onClick={() => {
                    setIsUploadOpen(false);
                    setUploadedFile(null);
                    setComments('');
                  }}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 overflow-y-auto text-left flex-1">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{selectedAssignment.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedAssignment.course}</p>
                </div>

                {/* Drag Drop Area */}
                <div 
                  onDragEnter={handleDrag} 
                  onDragOver={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    dragActive ? 'border-[#4700b3] bg-purple-50/30' : 'border-slate-200 hover:border-slate-350 bg-slate-50/50'
                  }`}
                >
                  <input 
                    type="file" 
                    id="assignment-file"
                    className="hidden" 
                    onChange={handleFileChange}
                    required={!uploadedFile}
                  />
                  
                  {uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <FiFileText size={36} className="text-[#4700b3] mb-2" />
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[300px]">
                        {uploadedFile.name}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <button 
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-red-500 hover:text-red-600 font-bold text-xs mt-3 bg-transparent border-none cursor-pointer"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="assignment-file" className="cursor-pointer flex flex-col items-center">
                      <FiUploadCloud size={40} className="text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-slate-700">
                        Drag and drop your file here, or <span className="text-[#4700b3] hover:underline">browse</span>
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1.5">
                        Supports PDF, PNG, JPG, ZIP (Max 10MB)
                      </span>
                    </label>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comments (Optional)</label>
                  <textarea 
                    rows={3}
                    placeholder="Leave a message for your instructor..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3] resize-none"
                  ></textarea>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsUploadOpen(false);
                      setUploadedFile(null);
                      setComments('');
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold transition-colors border-none cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!uploadedFile}
                    className={`flex-1 py-3.5 rounded-2xl font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 text-sm ${
                      uploadedFile 
                        ? 'bg-[#4700b3] hover:bg-[#3d0099] text-white shadow-sm' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <FiCheck size={16} /> Submit Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Submission details */}
        {viewingSubmission && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] overflow-hidden border border-slate-100 flex flex-col">
              {/* Header */}
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiEye size={20} />
                  <h3 className="text-lg font-extrabold tracking-tight">Submission Details</h3>
                </div>
                <button 
                  onClick={() => setViewingSubmission(null)}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-left">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{viewingSubmission.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{viewingSubmission.course}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Date</span>
                    <span className="text-xs font-bold text-slate-700 block mt-1">{viewingSubmission.submittedDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                    <span className="text-xs font-bold text-slate-700 block mt-1 capitalize">{viewingSubmission.status}</span>
                  </div>
                </div>

                {viewingSubmission.fileName && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Uploaded File</span>
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <FiFileText className="text-slate-400 shrink-0" size={18} />
                      <span className="text-xs font-bold text-slate-700 truncate flex-grow pr-2">
                        {viewingSubmission.fileName}
                      </span>
                    </div>
                  </div>
                )}

                {/* Grade & Comments if Graded */}
                {viewingSubmission.status === 'Graded' ? (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Final Grade</span>
                      <span className="text-lg font-black text-emerald-800">{viewingSubmission.grade}</span>
                    </div>
                    {viewingSubmission.comments && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Instructor Comments</span>
                        <p className="text-xs font-semibold text-slate-600 mt-1 italic">"{viewingSubmission.comments}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 bg-amber-50 text-amber-800 p-3 rounded-2xl border border-amber-100 text-[11px] font-semibold leading-relaxed">
                    <FiAlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>This submission is currently awaiting grading by your course instructor. You will receive an alert once graded.</p>
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    onClick={() => setViewingSubmission(null)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all border-none cursor-pointer text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Share Certificate commented out */}
        {/*
        {sharingCert && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[450px] overflow-hidden border border-slate-100 flex flex-col">
              
              <div className="p-6 bg-[#4700b3] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiShare2 size={18} />
                  <h3 className="text-lg font-extrabold tracking-tight">Share Certificate</h3>
                </div>
                <button 
                  onClick={() => setSharingCert(null)}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  Share your accomplishment in **{sharingCert.title}** with your network!
                </p>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button 
                    onClick={() => {
                      setToastMessage("Link copied to clipboard!");
                      setShowToast(true);
                      setSharingCert(null);
                      setTimeout(() => setShowToast(false), 4000);
                    }}
                    className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                  >
                    Copy Credentials Link
                  </button>
                  <button 
                    onClick={() => {
                      setToastMessage("Sharing on LinkedIn...");
                      setShowToast(true);
                      setSharingCert(null);
                      setTimeout(() => setShowToast(false), 4000);
                    }}
                    className="w-full py-3.5 bg-[#0077b5] text-white hover:opacity-90 rounded-xl border-none font-bold transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    Share on LinkedIn
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setSharingCert(null)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all border-none cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
        */}

      </main>
    </div>
  );
};

export default StudentAssignments;
