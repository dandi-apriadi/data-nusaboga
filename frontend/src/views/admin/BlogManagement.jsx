import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Card from "components/card";
import ResponsiveTable from 'components/ResponsiveTable';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdFilterList, 
  MdVisibility,
  MdMoreVert,
  MdViewList,
  MdRefresh,
  MdCategory,
  MdLocalOffer,
  MdDrafts,
  MdPublish,
  MdArchive,
  MdStar,
  MdStarBorder,
  MdVisibilityOff,
  MdTrendingUp,
  MdClose,
  MdCloudUpload
} from "react-icons/md";
import {
  fetchBlogPosts,
  fetchBlogCategories,
  fetchBlogTags,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createBlogCategory,
  deleteBlogCategory,
  createBlogTag,
  deleteBlogTag,
  clearErrors
} from "store/slices/blogSlice";

const BlogManagement = () => {
  const dispatch = useDispatch();
  const { 
    posts, 
    categories, 
    tags, 
    postsLoading, 
    categoriesLoading, 
    tagsLoading,
    error,
    postsTotal,
    postsCurrentPage,
    postsTotalPages,
    postsPerPage
  } = useSelector((state) => state.blog);

  // Defensive normalization for posts state (in case legacy shape)
  const normalizedPosts = Array.isArray(posts)
    ? posts
    : (Array.isArray(posts?.posts) ? posts.posts : []);

  // Data statis kategori sebagai fallback
  const staticCategories = [
    { category_id: 'BLC_RESEP', name: 'Resep Cakalang', color: '#6366f1', active: true, posts_count: 0 },
    { category_id: 'BLC_TIPS', name: 'Tips Masak', color: '#8b5cf6', active: true, posts_count: 0 },
    { category_id: 'BLC_NUTRISI', name: 'Nutrisi & Kesehatan', color: '#10b981', active: true, posts_count: 0 },
    { category_id: 'BLC_BUDAYA', name: 'Budaya Kuliner', color: '#f59e0b', active: true, posts_count: 0 },
    { category_id: 'BLC_PRODUK', name: 'Produk Unggulan', color: '#ef4444', active: true, posts_count: 0 }
  ];

  // Helper untuk normalisasi URL gambar (prefix base API jika relatif)
  const resolveImageUrl = (imgPath) => {
    if (!imgPath) return '';
    if (/^https?:\/\//i.test(imgPath)) return imgPath; // sudah absolute
    const apiBase = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
    const imageBase = (process.env.REACT_APP_IMAGE_BASE_URL || '/uploads');
    // Jika path sudah diawali '/', langsung prefix host API
    if (imgPath.startsWith('/')) {
      return apiBase + imgPath;
    }
    // Jika path tidak diawali '/', gabungkan dengan imageBase
    const base = imageBase.startsWith('/') ? imageBase : `/${imageBase}`;
    return `${apiBase}${base.replace(/\/$/, '')}/${imgPath}`;
  };

  const [activeTab, setActiveTab] = useState("posts"); // 'posts', 'categories', 'tags'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'create-post', 'edit-post', 'create-category', 'create-tag'
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentTime] = useState(new Date());

  // Form states
  const [postForm, setPostForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category_id: "",
    status: "DRAFT",
    is_featured: false,
    featured_image: "",
    meta_title: "",
    meta_description: "",
    slug: "",
    tags: []
  });

  // Image upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "#6366f1",
    active: true
  });

  const [tagForm, setTagForm] = useState({
    name: "",
    color: "#64748b"
  });
  const [newTagInput, setNewTagInput] = useState("");

  const toggleTagSelection = (tagObj) => {
    setPostForm(prev => {
      const exists = prev.tags.find(t => t.tag_id === tagObj.tag_id);
      if (exists) {
        return { ...prev, tags: prev.tags.filter(t => t.tag_id !== tagObj.tag_id) };
      }
      return { ...prev, tags: [...prev.tags, tagObj] };
    });
  };

  const addNewTagFromInput = () => {
    const name = newTagInput.trim();
    if (!name) return;
    // Jika tag dengan nama sama sudah ada di state tags global, gunakan itu
    const existing = tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      toggleTagSelection(existing);
      setNewTagInput("");
      return;
    }
    // Tambah sebagai tag baru sementara (tanpa id). Backend akan create saat submit.
    const tempTag = { tag_id: `temp-${Date.now()}`, name, color: '#64748b' };
    setPostForm(prev => ({ ...prev, tags: [...prev.tags, tempTag] }));
    setNewTagInput("");
  };

  useEffect(() => {
    dispatch(fetchBlogPosts({ page: 1, limit: 10 }));
    dispatch(fetchBlogCategories());
    dispatch(fetchBlogTags());
  }, [dispatch]);

  useEffect(() => {
    // DEBUG LOG CATEGORIES
    console.log('[DEBUG] categories state:', categories);
    console.log('[DEBUG] categoriesLoading:', categoriesLoading);
  }, [categories, categoriesLoading]);

  // Gabungkan categories dari API dengan data statis sebagai fallback
  const availableCategories = categories.length > 0 ? categories : staticCategories;

  const handleSearch = (page = 1) => {
    const params = {
      page,
      limit: postsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { category_id: selectedCategory }),
      ...(selectedStatus && { status: selectedStatus })
    };
    dispatch(fetchBlogPosts(params));
  };

  const handlePageChange = (page) => {
    handleSearch(page);
  };

  const handleCreatePost = () => {
    setModalType("create-post");
    setPostForm({
      title: "",
      excerpt: "",
      content: "",
      category_id: "",
      status: "DRAFT",
      is_featured: false,
      featured_image: "",
      meta_title: "",
      meta_description: "",
      slug: "",
      tags: []
    });
    
    // Reset image state
    clearImageSelection();
    
    setIsModalOpen(true);
  };

  const handleEditPost = (post) => {
    setModalType("edit-post");
    setSelectedItem(post);
    setPostForm({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      category_id: post.category_id || "",
      status: post.status,
      is_featured: post.is_featured || false,
      featured_image: post.featured_image || "",
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      slug: post.slug || "",
      tags: post.tags || []
    });
    
    // Set existing image preview if available
    if (post.featured_image) {
      setImagePreview(resolveImageUrl(post.featured_image));
    } else {
      setImagePreview('');
    }
    setSelectedFile(null);
    
    setIsModalOpen(true);
  };

  const handleDeletePost = async (post) => {
    if (window.confirm(`Yakin ingin menghapus blog post "${post.title}"?`)) {
      try {
        await dispatch(deleteBlogPost(post.post_id)).unwrap();
        handleSearch(postsCurrentPage);
        alert('Blog post berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Gagal menghapus blog post: ' + error);
      }
    }
  };

  const handleSavePost = async () => {
    try {
      // Validation
      if (!postForm.title.trim()) {
        alert('Judul blog post harus diisi.');
        return;
      }
      
      if (!postForm.content.trim()) {
        alert('Konten blog post harus diisi.');
        return;
      }
      
      if (!postForm.category_id) {
        alert('Kategori harus dipilih.');
        return;
      }
      
      setUploadingImage(true);
      
      // Prepare form data
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('title', postForm.title);
      formDataToSend.append('content', postForm.content);
      formDataToSend.append('excerpt', postForm.excerpt);
      formDataToSend.append('category_id', postForm.category_id);
      formDataToSend.append('status', postForm.status);
      formDataToSend.append('is_featured', postForm.is_featured);
      formDataToSend.append('meta_title', postForm.meta_title);
      formDataToSend.append('meta_description', postForm.meta_description);
      
      // Add tags if any
      if (postForm.tags && postForm.tags.length > 0) {
        formDataToSend.append('tags', JSON.stringify(postForm.tags));
      }
      
      // Add image file if selected
      if (selectedFile) {
        formDataToSend.append('featured_image', selectedFile);
      }

      if (modalType === "create-post") {
        await dispatch(createBlogPost(formDataToSend)).unwrap();
        alert('Blog post berhasil dibuat!');
      } else if (modalType === "edit-post") {
        await dispatch(updateBlogPost({ 
          id: selectedItem.post_id, 
          postData: formDataToSend 
        })).unwrap();
        alert('Blog post berhasil diupdate!');
      }
      
      // Reset form and close modal
      setIsModalOpen(false);
      setPostForm({
        title: "",
        excerpt: "",
        content: "",
        category_id: "",
        status: "DRAFT",
        is_featured: false,
        featured_image: "",
        meta_title: "",
        meta_description: "",
        slug: "",
        tags: []
      });
      clearImageSelection();
      handleSearch(postsCurrentPage);
      
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Gagal menyimpan blog post: ' + error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await dispatch(createBlogCategory(categoryForm)).unwrap();
      setCategoryForm({ name: "", description: "", color: "#6366f1", active: true });
      dispatch(fetchBlogCategories());
      alert('Kategori berhasil dibuat!');
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Gagal membuat kategori: ' + error);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Yakin ingin menghapus kategori "${category.name}"?`)) {
      try {
        await dispatch(deleteBlogCategory(category.category_id)).unwrap();
        dispatch(fetchBlogCategories());
        alert('Kategori berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Gagal menghapus kategori: ' + error);
      }
    }
  };

  const handleCreateTag = async () => {
    try {
      await dispatch(createBlogTag(tagForm)).unwrap();
      setTagForm({ name: "", color: "#64748b" });
      dispatch(fetchBlogTags());
      alert('Tag berhasil dibuat!');
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Gagal membuat tag: ' + error);
    }
  };

  const handleDeleteTag = async (tag) => {
    if (window.confirm(`Yakin ingin menghapus tag "${tag.name}"?`)) {
      try {
        await dispatch(deleteBlogTag(tag.tag_id)).unwrap();
        dispatch(fetchBlogTags());
        alert('Tag berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting tag:', error);
        alert('Gagal menghapus tag: ' + error);
      }
    }
  };

  // Image upload functions
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Hanya file JPG, PNG, dan WebP yang diizinkan.');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Ukuran file maksimal 5MB.');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImageSelection = () => {
    setSelectedFile(null);
    setImagePreview("");
    setPostForm(prev => ({ ...prev, featured_image: "" }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { bg: "bg-slate-100", text: "text-slate-700", label: "Draft" },
      PUBLISHED: { bg: "bg-green-100", text: "text-green-700", label: "Published" },
      ARCHIVED: { bg: "bg-amber-100", text: "text-amber-700", label: "Archived" }
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const renderPostsTab = () => (
    <div>
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl" />
            <input
              type="text"
              placeholder="Cari blog post..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Kategori</option>
            {availableCategories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          
          <button
            onClick={() => handleSearch()}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <MdFilterList className="text-xl" />
          </button>
          
          <button
            onClick={handleCreatePost}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <MdAdd className="text-xl" />
            <span className="hidden lg:inline">Post Baru</span>
          </button>
        </div>
      </div>

      {/* Posts Table */}
      <Card extra="overflow-hidden">
        <ResponsiveTable>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {postsLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Tidak ada blog post ditemukan
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.post_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {post.featured_image && (
                          <img
                            src={resolveImageUrl(post.featured_image)}
                            alt={post.title}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-slate-900 truncate">
                              {post.title}
                            </h3>
                            {post.is_featured && (
                              <MdStar className="text-amber-500 text-sm flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag.tag_id}
                                  className="px-2 py-0.5 text-xs rounded-full"
                                  style={{ 
                                    backgroundColor: `${tag.color}20`, 
                                    color: tag.color 
                                  }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-slate-400">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.category && (
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{ 
                            backgroundColor: `${post.category.color}20`, 
                            color: post.category.color 
                          }}
                        >
                          {post.category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <MdVisibility className="text-slate-400" />
                        {post.views_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {post.published_at 
                        ? format(new Date(post.published_at), "dd MMM yyyy", { locale: id })
                        : format(new Date(post.created_at), "dd MMM yyyy", { locale: id })
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <MdEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Hapus"
                        >
                          <MdDelete className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTable>

        {/* Pagination */}
        {postsTotalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Menampilkan {((postsCurrentPage - 1) * postsPerPage) + 1} - {Math.min(postsCurrentPage * postsPerPage, postsTotal)} dari {postsTotal} post
              </div>
              <div className="flex gap-1">
                {Array.from({ length: postsTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      page === postsCurrentPage
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  const renderCategoriesTab = () => (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Category Form */}
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Buat Kategori Baru</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Kategori
              </label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Masukkan nama kategori"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Deskripsi
              </label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Deskripsi kategori (opsional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Warna
              </label>
              <input
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 border border-slate-200 rounded-lg"
              />
            </div>
            <button
              onClick={handleCreateCategory}
              disabled={!categoryForm.name.trim() || categoriesLoading}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {categoriesLoading ? 'Menyimpan...' : 'Buat Kategori'}
            </button>
          </div>
        </Card>

        {/* Categories List */}
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Daftar Kategori</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {categoriesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Belum ada kategori</p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.category_id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <h4 className="font-medium text-slate-900">{category.name}</h4>
                      <p className="text-sm text-slate-500">
                        {category.posts_count || 0} post
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {category.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Hapus kategori"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderTagsTab = () => (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Tag Form */}
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Buat Tag Baru</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Tag
              </label>
              <input
                type="text"
                value={tagForm.name}
                onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Masukkan nama tag"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Warna
              </label>
              <input
                type="color"
                value={tagForm.color}
                onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 border border-slate-200 rounded-lg"
              />
            </div>
            <button
              onClick={handleCreateTag}
              disabled={!tagForm.name.trim() || tagsLoading}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {tagsLoading ? 'Menyimpan...' : 'Buat Tag'}
            </button>
          </div>
        </Card>

        {/* Tags List */}
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Daftar Tag</h3>
          <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
            {tagsLoading ? (
              <div className="w-full text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : tags.length === 0 ? (
              <p className="text-slate-500 text-center py-4 w-full">Belum ada tag</p>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.tag_id}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: `${tag.color}20`, 
                    color: tag.color,
                    border: `1px solid ${tag.color}40`
                  }}
                >
                  <span>{tag.name}</span>
                  <span className="text-xs opacity-60">
                    ({tag.posts_count || 0})
                  </span>
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    className="ml-1 p-0.5 text-red-600 hover:bg-red-50 rounded-full"
                    title="Hapus tag"
                  >
                    <MdClose className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="mt-5 grid h-full w-full gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Blog Management</h2>
          <p className="text-slate-600 mt-1">
            Kelola blog posts, kategori, dan tag untuk website
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {format(currentTime, "EEEE, dd MMMM yyyy 'pukul' HH:mm", { locale: id })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card extra="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Posts</p>
              <p className="text-2xl font-bold text-slate-900">{postsTotal}</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MdViewList className="text-xl text-indigo-600" />
            </div>
          </div>
        </Card>
        
        <Card extra="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {normalizedPosts.filter(p => p.status === 'PUBLISHED').length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <MdPublish className="text-xl text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card extra="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Categories</p>
              <p className="text-2xl font-bold text-purple-600">{availableCategories.length}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <MdCategory className="text-xl text-purple-600" />
            </div>
          </div>
        </Card>
        
        <Card extra="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Tags</p>
              <p className="text-2xl font-bold text-amber-600">{tags.length}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <MdLocalOffer className="text-xl text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card extra="p-0">
        <div className="border-b border-slate-200">
          <nav className="flex">
            {[
              { id: 'posts', label: 'Blog Posts', icon: MdViewList },
              { id: 'categories', label: 'Kategori', icon: MdCategory },
              { id: 'tags', label: 'Tags', icon: MdLocalOffer }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="text-lg" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'posts' && renderPostsTab()}
          {activeTab === 'categories' && renderCategoriesTab()}
          {activeTab === 'tags' && renderTagsTab()}
        </div>
      </Card>

      {/* Post Modal */}
      {isModalOpen && (modalType === 'create-post' || modalType === 'edit-post') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {modalType === 'create-post' ? 'Buat Blog Post Baru' : 'Edit Blog Post'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Judul *
                  </label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Judul blog post"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={postForm.category_id}
                    onChange={(e) => setPostForm(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Pilih kategori</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Ringkasan singkat blog post"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Konten *
                </label>
                <textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows="10"
                  placeholder="Konten lengkap blog post"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Featured Image
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <MdCloudUpload className="w-8 h-8 mb-2 text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500">
                            <span className="font-semibold">Click to upload</span> atau drag and drop
                          </p>
                          <p className="text-xs text-slate-500">PNG, JPG, WebP (Max 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={clearImageSelection}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <MdClose className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {selectedFile && (
                      <div className="text-sm text-slate-600">
                        File terpilih: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={postForm.status}
                    onChange={(e) => setPostForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={postForm.meta_title}
                        onChange={(e) => setPostForm(prev => ({ ...prev, meta_title: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="SEO meta title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        value={postForm.meta_description}
                        onChange={(e) => setPostForm(prev => ({ ...prev, meta_description: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder="SEO meta description"
                      />
                    </div>
                    {modalType === 'edit-post' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Slug (read-only)
                        </label>
                        <input
                          type="text"
                          value={postForm.slug}
                          readOnly
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={postForm.is_featured}
                    onChange={(e) => setPostForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Featured Post
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {postForm.tags.map(tag => (
                    <span key={tag.tag_id} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {tag.name}
                      <button type="button" onClick={() => toggleTagSelection(tag)} className="text-slate-500 hover:text-red-600">
                        <MdClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {postForm.tags.length === 0 && (
                    <span className="text-xs text-slate-400">Belum ada tag dipilih</span>
                  )}
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewTagFromInput(); } }}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tambah tag baru lalu Enter"
                  />
                  <button
                    type="button"
                    onClick={addNewTagFromInput}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm"
                  >Tambah</button>
                </div>
                <div className="border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto bg-slate-50">
                  {tagsLoading && <p className="text-xs text-slate-500">Memuat tag...</p>}
                  {!tagsLoading && tags.length === 0 && (
                    <p className="text-xs text-slate-400">Belum ada tag tersedia.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => {
                      const active = !!postForm.tags.find(t => t.tag_id === tag.tag_id);
                      return (
                        <button
                          type="button"
                          key={tag.tag_id}
                          onClick={() => toggleTagSelection(tag)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSavePost}
                disabled={!postForm.title.trim() || !postForm.content.trim() || !postForm.category_id || uploadingImage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {uploadingImage && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {uploadingImage 
                  ? 'Menyimpan...' 
                  : modalType === 'create-post' ? 'Buat Post' : 'Update Post'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;