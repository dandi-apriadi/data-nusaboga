import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CloudArrowUpIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';

const ReviewForm = ({ 
  productId, 
  onSubmit, 
  onClose, 
  loading = false,
  error = null 
}) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: []
  });
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      alert('Mohon berikan rating untuk produk ini');
      return;
    }
    
    if (formData.comment.trim().length < 10) {
      alert('Komentar minimal 10 karakter');
      return;
    }

    try {
      await onSubmit({
        product_id: productId,
        ...formData
      });
      
      // Reset form setelah sukses
      setFormData({
        rating: 0,
        title: '',
        comment: '',
        images: []
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleImageUpload = (files) => {
    const validFiles = Array.from(files).filter(file => {
      return file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024; // 5MB limit
    });

    if (validFiles.length + formData.images.length > 5) {
      alert('Maksimal 5 foto per review');
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const rating = index + 1;
      const isFilled = rating <= formData.rating;
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => handleRatingClick(rating)}
          className="p-1 hover:scale-110 transition-transform"
        >
          {isFilled ? (
            <StarIcon className="w-8 h-8 text-amber-500" />
          ) : (
            <StarOutlineIcon className="w-8 h-8 text-slate-300 hover:text-amber-400" />
          )}
        </button>
      );
    });
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Sangat tidak puas',
      2: 'Tidak puas',
      3: 'Biasa saja',
      4: 'Puas',
      5: 'Sangat puas'
    };
    return texts[rating] || '';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Tulis Review</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-1">
            {renderStars()}
          </div>
          {formData.rating > 0 && (
            <p className="text-sm text-slate-600 mt-1">
              {getRatingText(formData.rating)}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Judul Review (opsional)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ringkas pengalaman Anda dengan produk ini"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={100}
          />
          <p className="text-xs text-slate-500 mt-1">
            {formData.title.length}/100 karakter
          </p>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Komentar <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Ceritakan pengalaman Anda dengan produk ini. Apa yang Anda suka atau tidak suka?"
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-slate-500 mt-1">
            {formData.comment.length}/1000 karakter (minimal 10)
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Foto Produk (opsional)
          </label>
          
          {/* Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-slate-400" />
              <div className="mt-2">
                <label className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Klik untuk upload
                  </span>
                  <span className="text-slate-600"> atau drag & drop</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, WEBP hingga 5MB (maksimal 5 foto)
              </p>
            </div>
          </div>

          {/* Preview uploaded images */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
              {formData.images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-20 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {formData.images.length < 5 && (
                <label className="w-full h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors">
                  <PlusIcon className="w-6 h-6 text-slate-400" />
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Submit buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || formData.rating === 0 || formData.comment.trim().length < 10}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Mengirim...' : 'Kirim Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;