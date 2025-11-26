import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { blogApi } from '../../api/blogApi';

// ==================== ASYNC THUNKS ====================

// Blog Posts
export const fetchBlogPosts = createAsyncThunk(
  'blog/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await blogApi.getPosts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog posts');
    }
  }
);

export const fetchBlogPostById = createAsyncThunk(
  'blog/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await blogApi.getPostById(postId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog post');
    }
  }
);

export const createBlogPost = createAsyncThunk(
  'blog/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await blogApi.createPost(postData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create blog post');
    }
  }
);

export const updateBlogPost = createAsyncThunk(
  'blog/updatePost',
  async ({ id, postData }, { rejectWithValue }) => {
    try {
      const response = await blogApi.updatePost(id, postData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update blog post');
    }
  }
);

export const deleteBlogPost = createAsyncThunk(
  'blog/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await blogApi.deletePost(postId);
      return { postId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog post');
    }
  }
);

// Blog Categories
export const fetchBlogCategories = createAsyncThunk(
  'blog/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await blogApi.getCategories(params);
      return response;
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        try {
          // Fallback ke endpoint public
            const publicResp = await blogApi.getPublicCategories?.(params);
            if (publicResp) return publicResp;
        } catch (e2) {
          return rejectWithValue(e2.response?.data?.message || 'Failed to fetch blog categories (public)');
        }
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog categories');
    }
  }
);

export const createBlogCategory = createAsyncThunk(
  'blog/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await blogApi.createCategory(categoryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create blog category');
    }
  }
);

export const updateBlogCategory = createAsyncThunk(
  'blog/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await blogApi.updateCategory(id, categoryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update blog category');
    }
  }
);

export const deleteBlogCategory = createAsyncThunk(
  'blog/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await blogApi.deleteCategory(categoryId);
      return { categoryId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog category');
    }
  }
);

// Blog Tags
export const fetchBlogTags = createAsyncThunk(
  'blog/fetchTags',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await blogApi.getTags(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog tags');
    }
  }
);

export const createBlogTag = createAsyncThunk(
  'blog/createTag',
  async (tagData, { rejectWithValue }) => {
    try {
      const response = await blogApi.createTag(tagData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create blog tag');
    }
  }
);

export const deleteBlogTag = createAsyncThunk(
  'blog/deleteTag',
  async (tagId, { rejectWithValue }) => {
    try {
      const response = await blogApi.deleteTag(tagId);
      return { tagId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog tag');
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  // Posts
  posts: [],
  currentPost: null,
  postsLoading: false,
  postsError: null,
  postsTotal: 0,
  postsCurrentPage: 1,
  postsTotalPages: 0,
  postsPerPage: 10,

  // Categories
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  categoriesTotal: 0,

  // Tags
  tags: [],
  tagsLoading: false,
  tagsError: null,
  tagsTotal: 0,

  // General
  error: null,
  loading: false
};

// ==================== BLOG SLICE ====================

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.postsError = null;
      state.categoriesError = null;
      state.tagsError = null;
    },
    setPostsPage: (state, action) => {
      state.postsCurrentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // ========== POSTS ==========
      .addCase(fetchBlogPosts.pending, (state) => {
        state.postsLoading = true;
        state.postsError = null;
      })
      .addCase(fetchBlogPosts.fulfilled, (state, action) => {
        state.postsLoading = false;
        const payload = action.payload || {};
        // Support multiple possible shapes:
        // { success, data: { posts: [], total, current_page, total_pages, per_page } }
        // { data: [] }
        // { posts: [], total, ... }
        const dataObj = payload.data && !Array.isArray(payload.data) ? payload.data : null;
        const postsArray = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.posts)
            ? payload.posts
            : Array.isArray(dataObj?.posts)
              ? dataObj.posts
              : [];
        state.posts = postsArray;
        state.postsTotal = dataObj?.total || payload?.total || postsArray.length || 0;
        state.postsCurrentPage = dataObj?.current_page || payload?.current_page || 1;
        state.postsTotalPages = dataObj?.total_pages || payload?.total_pages || 0;
        state.postsPerPage = dataObj?.per_page || payload?.per_page || 10;
      })
      .addCase(fetchBlogPosts.rejected, (state, action) => {
        state.postsLoading = false;
        state.postsError = action.payload || action.error.message;
      })

      .addCase(fetchBlogPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload?.data || null;
      })
      .addCase(fetchBlogPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(createBlogPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlogPost.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.posts.unshift(action.payload.data);
          state.postsTotal += 1;
        }
      })
      .addCase(createBlogPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(updateBlogPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlogPost.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          const index = state.posts.findIndex(post => post.post_id === action.payload.data.post_id);
          if (index !== -1) {
            state.posts[index] = action.payload.data;
          }
        }
      })
      .addCase(updateBlogPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(deleteBlogPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlogPost.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.postId) {
          state.posts = state.posts.filter(post => post.post_id !== action.payload.postId);
          state.postsTotal = Math.max(0, state.postsTotal - 1);
        }
      })
      .addCase(deleteBlogPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // ========== CATEGORIES ==========
      .addCase(fetchBlogCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        const payload = action.payload;
        const dataArray = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload?.data) ? payload.data : []);
        state.categories = dataArray;
        state.categoriesTotal = payload?.total || dataArray.length || 0;
      })
      .addCase(fetchBlogCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload || action.error.message;
        if (process.env.REACT_APP_DEBUG_MODE === 'true') {
          console.error('[BLOG][CATEGORIES] Fetch failed:', action.payload || action.error);
        }
      })

      .addCase(createBlogCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlogCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.categories.push(action.payload.data);
          state.categoriesTotal += 1;
        }
      })
      .addCase(createBlogCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(updateBlogCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlogCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          const index = state.categories.findIndex(cat => cat.category_id === action.payload.data.category_id);
          if (index !== -1) {
            state.categories[index] = action.payload.data;
          }
        }
      })
      .addCase(updateBlogCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(deleteBlogCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlogCategory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.categoryId) {
          state.categories = state.categories.filter(cat => cat.category_id !== action.payload.categoryId);
          state.categoriesTotal = Math.max(0, state.categoriesTotal - 1);
        }
      })
      .addCase(deleteBlogCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // ========== TAGS ==========
      .addCase(fetchBlogTags.pending, (state) => {
        state.tagsLoading = true;
        state.tagsError = null;
      })
      .addCase(fetchBlogTags.fulfilled, (state, action) => {
        state.tagsLoading = false;
        state.tags = action.payload?.data || [];
        state.tagsTotal = action.payload?.total || action.payload?.data?.length || 0;
      })
      .addCase(fetchBlogTags.rejected, (state, action) => {
        state.tagsLoading = false;
        state.tagsError = action.payload || action.error.message;
      })

      .addCase(createBlogTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlogTag.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.tags.push(action.payload.data);
          state.tagsTotal += 1;
        }
      })
      .addCase(createBlogTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(deleteBlogTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlogTag.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.tagId) {
          state.tags = state.tags.filter(tag => tag.tag_id !== action.payload.tagId);
          state.tagsTotal = Math.max(0, state.tagsTotal - 1);
        }
      })
      .addCase(deleteBlogTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export const { clearCurrentPost, clearErrors, setPostsPage } = blogSlice.actions;

export default blogSlice.reducer;