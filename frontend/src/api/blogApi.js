import api from '../utils/api';

export const blogApi = {
  // =============== BLOG POSTS ===============
  
  // Get all blog posts (admin)
  getPosts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/api/v1/blog/posts?${queryParams.toString()}`);
    return response.data;
  },

  // Get single blog post
  getPostById: async (postId) => {
    const response = await api.get(`/api/v1/blog/posts/${postId}`);
    return response.data;
  },

  // Create new blog post
  createPost: async (postData) => {
    const config = {};
    // If FormData, let browser set Content-Type header
    if (postData instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data'
      };
    }
    const response = await api.post('/api/v1/blog/posts', postData, config);
    return response.data;
  },

  // Update blog post
  updatePost: async (postId, postData) => {
    const config = {};
    // If FormData, let browser set Content-Type header
    if (postData instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data'
      };
    }
    const response = await api.put(`/api/v1/blog/posts/${postId}`, postData, config);
    return response.data;
  },

  // Delete blog post
  deletePost: async (postId) => {
    const response = await api.delete(`/api/v1/blog/posts/${postId}`);
    return response.data;
  },

  // =============== BLOG CATEGORIES ===============
  
  // Get all categories (admin)
  getCategories: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const response = await api.get(`/api/v1/blog/categories?${queryParams.toString()}`);
    return response.data;
  },

  // Get public categories (active only)
  getPublicCategories: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const response = await api.get(`/api/v1/blog/categories/public?${queryParams.toString()}`);
    return response.data;
  },

  // Create new category
  createCategory: async (categoryData) => {
    const response = await api.post('/api/v1/blog/categories', categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/api/v1/blog/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/api/v1/blog/categories/${categoryId}`);
    return response.data;
  },

  // =============== BLOG TAGS ===============
  
  // Get all tags
  getTags: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/api/v1/blog/tags?${queryParams.toString()}`);
    return response.data;
  },

  // Create new tag
  createTag: async (tagData) => {
    const response = await api.post('/api/v1/blog/tags', tagData);
    return response.data;
  },

  // Delete tag
  deleteTag: async (tagId) => {
    const response = await api.delete(`/api/v1/blog/tags/${tagId}`);
    return response.data;
  },

  // =============== PUBLIC ROUTES (for customer view) ===============
  
  // Get published posts for customer
  getPublicPosts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/api/v1/blog/posts/public?${queryParams.toString()}`);
    return response.data;
  },

  // Get single published post for customer
  getPublicPostById: async (postId) => {
    const response = await api.get(`/api/v1/blog/posts/public/${postId}`);
    return response.data;
  },

  // Get active categories for customer
  getActiveCategories: async () => {
    const response = await api.get('/api/v1/blog/categories/public');
    return response.data;
  }
};

export default blogApi;