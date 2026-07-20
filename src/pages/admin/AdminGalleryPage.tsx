import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiImage, FiUpload, FiTrash2, FiX, FiSearch, FiFilter,
  FiStar, FiChevronLeft, FiChevronRight, FiCheck, FiMove,
  FiZoomIn, FiZoomOut, FiAlertTriangle,
} from 'react-icons/fi';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';


// ─── Types ───────────────────────────────────────────────────────────────────
interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  isFeatured: boolean;
  order: number;
  createdAt: string;
}


const API_BASE = 'http://localhost:5000';
const ITEMS_PER_PAGE = 12;
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = '.jpg,.jpeg,.png';

// ─── Helper: create cropped image blob ───────────────────────────────────────
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/jpeg', 0.92);
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminGalleryPage: React.FC = () => {
  // Images & pagination
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);

  // Dynamic courses from API
  const [courses, setCourses] = useState<string[]>([]);

  // Search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterFeatured, setFilterFeatured] = useState(false);

  // Upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Drag and drop
  const dragItemRef = useRef<string | null>(null);
  const dragOverItemRef = useRef<string | null>(null);

  // Debounce timer ref
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Fetch images ────────────────────────────────────────────────────────
  const fetchImages = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      });
      if (searchTerm) params.set('search', searchTerm);
      if (filterCategory && filterCategory !== 'All') params.set('category', filterCategory);
      if (filterFeatured) params.set('featured', 'true');

      const res = await fetch(`${API_BASE}/api/gallery?${params}`);
      if (!res.ok) throw new Error('Failed to fetch images');
      const data = await res.json();

      setImages(data.images);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalImages(data.totalImages);
    } catch (err) {
      console.error(err);
      setError('Failed to load gallery images.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterCategory, filterFeatured]);

  useEffect(() => {
    fetchImages(1);
  }, [fetchImages]);

  // Fetch active courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseRes = await fetch(`${API_BASE}/api/courses?limit=1000&status=Active`);
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          if (courseData && courseData.courses) {
            const courseNames = courseData.courses.map((c: { courseName: string }) => {
              const name = c.courseName || '';
              let cleaned = name.replace(/\b(beginner|advanced|intermediate)\b/gi, '')
                .replace(/\(\s*\)/g, '')
                .replace(/^[\s-–—:]+|[\s-–—:]+$/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              return cleaned;
            }).filter(Boolean);
            setCourses(Array.from(new Set(courseNames)));
          }
        }
      } catch (err) {
        console.error('Error loading courses:', err);
      }
    };
    fetchCourses();
  }, []);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
  };

  // ─── File selection ──────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const errors: string[] = [];

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push('Format must be JPG, JPEG, or PNG.');
      }

      // Validate file size (1MB)
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 1MB limit.`);
      }

      // If type/size already failed, reject immediately (no need to check dimensions)
      if (errors.length > 0 && !ALLOWED_TYPES.includes(file.type)) {
        setError(`Image doesn't meet the requirements:\n• ${errors.join('\n• ')}`);
        e.target.value = '';
        return;
      }

      // Validate image dimensions (must be 1200×1600)
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth !== 1200 || img.naturalHeight !== 1600) {
          errors.push(`Dimensions must be 1200×1600px (yours: ${img.naturalWidth}×${img.naturalHeight}px).`);
        }

        URL.revokeObjectURL(url);

        if (errors.length > 0) {
          setError(`Image doesn't meet the requirements:\n• ${errors.join('\n• ')}`);
          e.target.value = '';
          return;
        }

        // All checks passed — show the cropper
        setError(null);
        setSelectedFile(file);
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrl(previewUrl);
        setShowCropper(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError('Could not read the image file. Please try another image.');
        e.target.value = '';
      };
      img.src = url;
    }
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // ─── Upload ──────────────────────────────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !previewUrl) {
      setError('Please provide a title and select an image.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);

      // If cropped, send the cropped blob; otherwise the original file
      if (croppedAreaPixels && previewUrl) {
        const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
        formData.append('image', croppedBlob, 'cropped-image.jpg');
      } else if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await fetch(`${API_BASE}/api/gallery`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Upload failed');
      }

      // Reset form & close modal
      resetUploadForm();
      fetchImages(currentPage);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error uploading image.');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setIsUploadModalOpen(false);
    setTitle('');
    setDescription('');
    setCategory('Uncategorized');
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowCropper(false);
    setCroppedAreaPixels(null);
    setError(null);
  };

  // ─── Delete single ──────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/gallery/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete image');
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      fetchImages(currentPage);
    } catch (err) {
      console.error(err);
      alert('Error deleting image.');
    }
  };

  // ─── Bulk delete ─────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected image(s)?`)) return;
    try {
      setBulkDeleting(true);
      const res = await fetch(`${API_BASE}/api/gallery/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (!res.ok) throw new Error('Bulk delete failed');
      setSelectedIds(new Set());
      fetchImages(currentPage);
    } catch (err) {
      console.error(err);
      alert('Error deleting images.');
    } finally {
      setBulkDeleting(false);
    }
  };

  // ─── Toggle featured ────────────────────────────────────────────────────
  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/gallery/${id}/featured`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to toggle featured');
      const updated = await res.json();
      setImages((prev) => prev.map((img) => (img._id === id ? updated : img)));
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Checkbox toggle ────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map((img) => img._id)));
    }
  };

  // ─── Drag & Drop ────────────────────────────────────────────────────────
  const handleDragStart = (id: string) => {
    dragItemRef.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverItemRef.current = id;
  };

  const handleDrop = async () => {
    if (!dragItemRef.current || !dragOverItemRef.current) return;
    if (dragItemRef.current === dragOverItemRef.current) return;

    const draggedIdx = images.findIndex((img) => img._id === dragItemRef.current);
    const overIdx = images.findIndex((img) => img._id === dragOverItemRef.current);

    if (draggedIdx === -1 || overIdx === -1) return;

    const reordered = [...images];
    const [removed] = reordered.splice(draggedIdx, 1);
    reordered.splice(overIdx, 0, removed);

    setImages(reordered);

    // Save new order to backend
    const orderPayload = reordered.map((img, idx) => ({ id: img._id, order: idx }));
    try {
      await fetch(`${API_BASE}/api/gallery/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: orderPayload }),
      });
    } catch (err) {
      console.error('Error saving reorder:', err);
    }

    dragItemRef.current = null;
    dragOverItemRef.current = null;
  };

  // ─── Pagination helpers ──────────────────────────────────────────────────
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-10 pb-24">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1c1c28] mb-1">Gallery Management</h2>
            <p className="text-slate-500 font-medium">
              Upload and manage images for the public gallery.
              {totalImages > 0 && <span className="ml-2 text-slate-400">({totalImages} images)</span>}
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#6247df] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-900/20 hover:bg-[#5236cc] hover:shadow-xl hover:shadow-purple-900/30 transition-all"
          >
            <FiUpload size={18} /> Upload Image
          </button>
        </div>

        {/* ── Search & Filter Bar ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-slate-50 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium"
            />
          </div>

          {/* Course filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 appearance-none cursor-pointer"
            >
              <option value="All">All Courses</option>
              {courses.map((crs) => (
                <option key={crs} value={crs}>{crs}</option>
              ))}
            </select>
          </div>

          {/* Featured filter */}
          <button
            onClick={() => { setFilterFeatured(!filterFeatured); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              filterFeatured
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-white border-slate-200 text-slate-500 hover:border-amber-200 hover:text-amber-500'
            }`}
          >
            <FiStar size={16} className={filterFeatured ? 'fill-amber-400' : ''} /> Featured
          </button>

          {/* Select All / Bulk */}
          {images.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                selectedIds.size === images.length && images.length > 0
                  ? 'bg-purple-50 border-purple-200 text-[#6247df]'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-purple-200'
              }`}
            >
              <FiCheck size={16} /> {selectedIds.size === images.length && images.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {error && !isUploadModalOpen && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* ── Gallery Grid ───────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6247df]"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="bg-white rounded-[1.5rem] p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50">
            <div className="w-20 h-20 bg-purple-50 text-[#6247df] rounded-full flex items-center justify-center mx-auto mb-4">
              <FiImage size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#1c1c28] mb-2">No Images Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {searchTerm || filterCategory !== 'All' || filterFeatured
                ? 'No images match your current filters. Try adjusting your search.'
                : "Upload your first image to showcase it in the academy's gallery."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((img) => (
              <div
                key={img._id}
                draggable
                onDragStart={() => handleDragStart(img._id)}
                onDragOver={(e) => handleDragOver(e, img._id)}
                onDrop={handleDrop}
                className={`bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] border group hover:shadow-lg transition-all flex flex-col cursor-grab active:cursor-grabbing ${
                  selectedIds.has(img._id) ? 'border-[#6247df] ring-2 ring-purple-100' : 'border-slate-50'
                }`}
              >
                {/* Image area */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={img.imageUrl.startsWith('http') ? img.imageUrl : `${API_BASE}${img.imageUrl}`}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => setLightboxImage(img)}
                  />

                  {/* Top-left: checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(img._id); }}
                    className={`absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      selectedIds.has(img._id)
                        ? 'bg-[#6247df] text-white shadow-md'
                        : 'bg-white/80 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-white'
                    }`}
                  >
                    <FiCheck size={14} />
                  </button>

                  {/* Top-right: action buttons */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFeatured(img._id); }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${
                        img.isFeatured
                          ? 'bg-amber-400 text-white'
                          : 'bg-white/90 text-slate-400 hover:bg-amber-400 hover:text-white'
                      }`}
                      title={img.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <FiStar size={14} className={img.isFeatured ? 'fill-white' : ''} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(img._id); }}
                      className="w-8 h-8 bg-white/90 text-red-500 rounded-full flex items-center justify-center shadow hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete image"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                  {/* Featured badge */}
                  {img.isFeatured && (
                    <div className="absolute bottom-3 left-3 bg-amber-400 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                      <FiStar size={10} className="fill-white" /> Featured
                    </div>
                  )}

                  {/* Drag indicator */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-60 transition-opacity text-white">
                    <FiMove size={16} />
                  </div>
                </div>

                {/* Info area */}
                <div className="p-4 flex-1 flex flex-col" onClick={() => setLightboxImage(img)} style={{ cursor: 'pointer' }}>
                  <h4 className="font-bold text-[#1c1c28] text-base mb-1 truncate">{img.title}</h4>
                  {img.description && (
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{img.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold text-[#6247df] bg-purple-50 px-2 py-0.5 rounded-md">{img.category}</span>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(img.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => fetchImages(currentPage - 1)}
              disabled={currentPage <= 1}
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#6247df] hover:text-[#6247df] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft size={18} />
            </button>

            {getPageNumbers().map((pg, idx) =>
              typeof pg === 'string' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-bold">…</span>
              ) : (
                <button
                  key={pg}
                  onClick={() => fetchImages(pg)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    pg === currentPage
                      ? 'bg-[#6247df] text-white shadow-md shadow-purple-900/20'
                      : 'border border-slate-200 text-slate-600 hover:border-[#6247df] hover:text-[#6247df]'
                  }`}
                >
                  {pg}
                </button>
              ),
            )}

            <button
              onClick={() => fetchImages(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#6247df] hover:text-[#6247df] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        )}



      {/* ════════════════════════════════════════════════════════════════════
          BULK ACTION BAR (floating bottom)
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1c1c28] text-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-6 animate-[slideUp_0.25s_ease-out]">
          <span className="font-bold text-sm">{selectedIds.size} selected</span>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            {bulkDeleting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FiTrash2 size={16} />
            )}
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-slate-400 hover:text-white transition-colors font-semibold text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          UPLOAD MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#fdfcff] shrink-0">
              <h3 className="text-xl font-extrabold text-[#1c1c28] flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6247df] flex items-center justify-center">
                  <FiUpload size={16} />
                </div>
                Upload to Gallery
              </h3>
              <button onClick={resetUploadForm} className="text-slate-400 hover:text-slate-600 p-1">
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">

              <form onSubmit={handleUpload} className="flex flex-col gap-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-[#1c1c28] mb-2">Image Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Annual Art Exhibition 2024"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium placeholder:font-normal"
                    disabled={uploading}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-[#1c1c28] mb-2">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell the story behind this photo..."
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 transition-all font-medium placeholder:font-normal resize-none"
                    disabled={uploading}
                  />
                </div>

                {/* Course */}
                <div>
                  <label className="block text-sm font-bold text-[#1c1c28] mb-2">Course *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#6247df] focus:ring-2 focus:ring-purple-100 appearance-none cursor-pointer"
                    disabled={uploading}
                  >
                    <option value="Uncategorized">Select a course</option>
                    {courses.map((crs) => (
                      <option key={crs} value={crs}>{crs}</option>
                    ))}
                  </select>
                </div>

                {/* File picker + Cropper */}
                <div>
                  <label className="block text-sm font-bold text-[#1c1c28] mb-2">Select Image *</label>
                  <input
                    type="file"
                    accept={ALLOWED_EXTENSIONS}
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />

                  {showCropper && previewUrl ? (
                    <div className="flex flex-col gap-3">
                      {/* Cropper area */}
                      <div className="relative w-full h-56 bg-slate-900 rounded-xl overflow-hidden">
                        <Cropper
                          image={previewUrl}
                          crop={crop}
                          zoom={zoom}
                          aspect={3 / 4}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                        />
                      </div>

                      {/* Zoom controls */}
                      <div className="flex items-center gap-3 px-1">
                        <FiZoomOut size={16} className="text-slate-400" />
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="flex-1 accent-[#6247df]"
                        />
                        <FiZoomIn size={16} className="text-slate-400" />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCropper(false);
                            setPreviewUrl(null);
                            setSelectedFile(null);
                            setCroppedAreaPixels(null);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-red-500 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#6247df] hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
                        <FiImage size={32} className="mb-3 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-500">Click to upload an image</p>
                        <p className="text-xs mt-1">JPG, JPEG or PNG only (MAX. 1MB · 1200×1600px)</p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Validation warning — shown below the file picker */}
                {error && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-[shake_0.4s_ease-in-out]">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                        <FiAlertTriangle size={18} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-extrabold text-amber-800 mb-1.5">Image doesn't meet the requirements</h4>
                        <ul className="space-y-1">
                          {error.split('\n').filter(line => line.startsWith('•')).map((line, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-amber-700 font-medium">
                              <span className="text-amber-500 mt-0.5">✕</span>
                              <span>{line.replace('• ', '')}</span>
                            </li>
                          ))}
                          {!error.includes('•') && (
                            <li className="text-sm text-amber-700 font-medium">{error}</li>
                          )}
                        </ul>
                        <p className="text-xs text-amber-500 font-semibold mt-2.5">Required: JPG/JPEG/PNG · Max 1MB · 1200×1600px</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 mt-2 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetUploadForm}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-[#6247df] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#5236cc] hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Image'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════════════════════════════════════ */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="md:w-2/3 bg-slate-900 flex items-center justify-center min-h-[300px]">
              <img
                src={lightboxImage.imageUrl.startsWith('http') ? lightboxImage.imageUrl : `${API_BASE}${lightboxImage.imageUrl}`}
                alt={lightboxImage.title}
                className="w-full h-full object-contain max-h-[70vh]"
              />
            </div>

            {/* Details panel */}
            <div className="md:w-1/3 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-extrabold text-[#1c1c28] leading-tight">{lightboxImage.title}</h3>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 shrink-0 ml-2"
                >
                  <FiX size={22} />
                </button>
              </div>

              {lightboxImage.isFeatured && (
                <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-lg mb-4 w-fit">
                  <FiStar size={12} className="fill-amber-400" /> Featured Image
                </div>
              )}

              <span className="text-xs font-bold text-[#6247df] bg-purple-50 px-3 py-1 rounded-lg mb-4 w-fit">{lightboxImage.category}</span>

              {lightboxImage.description && (
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{lightboxImage.description}</p>
              )}

              <div className="mt-auto pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium">
                  Uploaded on {new Date(lightboxImage.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleToggleFeatured(lightboxImage._id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    lightboxImage.isFeatured
                      ? 'bg-amber-400 text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-500'
                  }`}
                >
                  <FiStar size={14} /> {lightboxImage.isFeatured ? 'Unfeatured' : 'Feature'}
                </button>
                <button
                  onClick={() => { handleDelete(lightboxImage._id); setLightboxImage(null); }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Inline keyframe for bulk bar animation ─────────────────────── */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(5px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
        }
      `}</style>
    </div>
  );
};

export default AdminGalleryPage;
