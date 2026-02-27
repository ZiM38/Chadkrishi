// ==================== DATA STRUCTURES ====================
const AREA_COORDINATES = {
  'Mirpur-1':   { lat: 23.8103, lng: 90.3563 },
  'Mirpur-14':  { lat: 23.7808, lng: 90.4125 },
  'Dhanmondi':  { lat: 23.7461, lng: 90.3742 },
  'Uttara':     { lat: 23.8759, lng: 90.3795 },
  'Gulshan':    { lat: 23.7806, lng: 90.4160 },
  'Banani':     { lat: 23.7937, lng: 90.4066 },
  'Mohammadpur':{ lat: 23.7679, lng: 90.3565 }
};


// ==================== UTILITY FUNCTIONS ====================

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Simple hash used only for sample local data (not for Firebase)
function hashPassword(password) {
  return btoa(password + 'salt');
}

function simulateAsync(callback, delay = 300) {
  return new Promise(resolve => {
    setTimeout(() => {
      const result = callback();
      resolve(result);
    }, delay);
  });
}


// ==================== STATE MANAGEMENT ====================

let currentUser = null;
let currentPage = 'login';
let posts = [];
let users = [];
let selectedPostId = null;
let isOperationInProgress = false;
window.postImages = [];


// ==================== DATA INITIALIZATION (sample local data for UI) ====================

function initializeSampleData() {
  const sampleUsers = [
    {
      id: 'user1',
      email: 'farmer_ali@test.com',
      password: hashPassword('Test1234'),
      username: 'FarmerAli',
      phone: '+8801711111111',
      phoneVisible: true,
      areaName: 'Mirpur-1',
      location: { lat: 23.8103, lng: 90.3563 },
      avatar: '',
      friends: [],
      isGuest: false,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000
    },
    {
      id: 'user2',
      email: 'rooftop_hassan@test.com',
      password: hashPassword('Test1234'),
      username: 'RooftopHassan',
      phone: '+8801722222222',
      phoneVisible: false,
      areaName: 'Mirpur-14',
      location: { lat: 23.7808, lng: 90.4125 },
      avatar: '',
      friends: [],
      isGuest: false,
      createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000
    },
    {
      id: 'user3',
      email: 'urban_garden@test.com',
      password: hashPassword('Test1234'),
      username: 'UrbanGardener',
      phone: '+8801733333333',
      phoneVisible: true,
      areaName: 'Dhanmondi',
      location: { lat: 23.7461, lng: 90.3742 },
      avatar: '',
      friends: [],
      isGuest: false,
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000
    }
  ];

  const samplePosts = [
    {
      id: generateId(),
      ownerId: 'user1',
      cropName: 'Organic Tomatoes',
      price: 150,
      currency: 'BDT',
      quantity: 5,
      unit: 'kg',
      description:
        'Fresh organic tomatoes from my rooftop garden. Pesticide-free!',
      areaName: 'Mirpur-1',
      location: { lat: 23.8103, lng: 90.3563 },
      status: 'available',
      images: [],
      views: 0,
      createdAt: Date.now() - 2 * 60 * 60 * 1000
    },
    {
      id: generateId(),
      ownerId: 'user1',
      cropName: 'Green Chilies',
      price: 80,
      currency: 'BDT',
      quantity: 500,
      unit: 'g',
      description: 'Spicy green chilies, perfect for cooking',
      areaName: 'Mirpur-1',
      location: { lat: 23.8103, lng: 90.3563 },
      status: 'available',
      images: [],
      views: 0,
      createdAt: Date.now() - 5 * 60 * 60 * 1000
    },
    {
      id: generateId(),
      ownerId: 'user2',
      cropName: 'Lettuce',
      price: 60,
      currency: 'BDT',
      quantity: 10,
      unit: 'piece',
      description: 'Hydroponic lettuce, fresh and crispy',
      areaName: 'Mirpur-14',
      location: { lat: 23.7808, lng: 90.4125 },
      status: 'available',
      images: [],
      views: 0,
      createdAt: Date.now() - 12 * 60 * 60 * 1000
    },
    {
      id: generateId(),
      ownerId: 'user2',
      cropName: 'Spinach',
      price: 40,
      currency: 'BDT',
      quantity: 3,
      unit: 'bunch',
      description: 'Fresh spinach bunches',
      areaName: 'Mirpur-14',
      location: { lat: 23.7808, lng: 90.4125 },
      status: 'sold',
      images: [],
      views: 0,
      createdAt: Date.now() - 24 * 60 * 60 * 1000
    },
    {
      id: generateId(),
      ownerId: 'user3',
      cropName: 'Bell Peppers',
      price: 120,
      currency: 'BDT',
      quantity: 2,
      unit: 'kg',
      description: 'Red and yellow bell peppers, sweet and crunchy',
      areaName: 'Dhanmondi',
      location: { lat: 23.7461, lng: 90.3742 },
      status: 'available',
      images: [],
      views: 0,
      createdAt: Date.now() - 8 * 60 * 60 * 1000
    },
    {
      id: generateId(),
      ownerId: 'user3',
      cropName: 'Cherry Tomatoes',
      price: 200,
      currency: 'BDT',
      quantity: 1,
      unit: 'kg',
      description: 'Sweet cherry tomatoes, perfect for salads',
      areaName: 'Dhanmondi',
      location: { lat: 23.7461, lng: 90.3742 },
      status: 'available',
      images: [],
      views: 0,
      createdAt: Date.now() - 3 * 60 * 60 * 1000
    }
  ];

  users = sampleUsers;
  posts = samplePosts;
}


// ==================== UI FUNCTIONS ====================

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function setLoading(element, isLoading) {
  if (!element) return;
  if (isLoading) {
    element.disabled = true;
    element.classList.add('loading');
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    element.insertBefore(spinner, element.firstChild);
  } else {
    element.disabled = false;
    element.classList.remove('loading');
    const spinner = element.querySelector('.spinner');
    if (spinner) spinner.remove();
  }
}

function navigateTo(pageName) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  const page = document.getElementById(`${pageName}-page`);
  if (page) {
    page.classList.add('active');
    currentPage = pageName;

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === pageName) {
        link.classList.add('active');
      }
    });

    const navbar = document.getElementById('navbar');
    if (pageName === 'login' || pageName === 'signup') {
      navbar.classList.add('hidden');
    } else {
      navbar.classList.remove('hidden');
    }

    if (pageName === 'dashboard') {
      loadDashboard();
    } else if (pageName === 'my-posts') {
      loadMyPosts();
    } else if (pageName === 'profile') {
      loadProfile();
    }
  }
}


// ==================== AUTH (Firebase) ====================

async function firebaseSignup(userData) {
  try {
    const cred = await auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );

    const uid = cred.user.uid;
    const location =
      AREA_COORDINATES[userData.areaName] || { lat: 23.8103, lng: 90.3563 };

    await db.collection('users').doc(uid).set({
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      phoneVisible: true,
      areaName: userData.areaName,
      location,
      avatar: '',
      friends: [],
      isGuest: false,
      createdAt: Date.now()
    });

    showToast('Account created successfully!');
    navigateTo('login');
    return true;
  } catch (err) {
    showToast(err.message || 'Signup failed', 'error');
    return false;
  }
}

async function firebaseLogin(email, password) {
  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    const uid = cred.user.uid;

    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      showToast('User profile not found', 'error');
      return false;
    }

    currentUser = { id: uid, ...doc.data() };
    showToast(`Welcome back, ${currentUser.username}!`);
    navigateTo('dashboard');
    return true;
  } catch (err) {
    showToast(err.message || 'Login failed', 'error');
    return false;
  }
}

function handleGuestLogin() {
  currentUser = {
    id: 'guest',
    username: 'Guest',
    email: 'guest@chadkrishi.com',
    isGuest: true,
    areaName: 'Dhaka',
    location: { lat: 23.8103, lng: 90.3563 }
  };
  showToast('Browsing as guest');
  navigateTo('dashboard');
}

async function handleLogout() {
  try {
    await auth.signOut();
  } catch (_) {}
  currentUser = null;
  navigateTo('login');
  showToast('Logged out successfully');
}


// ==================== POST FUNCTIONS (Firestore) ====================

async function createPost(postData) {
  if (!currentUser || currentUser.isGuest) {
    showGuestModal();
    return false;
  }

  const newPost = {
    ownerId: currentUser.id,
    cropName: postData.cropName,
    price: parseFloat(postData.price),
    currency: postData.currency,
    quantity: parseFloat(postData.quantity),
    unit: postData.unit,
    description: postData.description,
    areaName: currentUser.areaName,
    location: currentUser.location,
    status: 'available',
    images: postData.images || [],
    externalLink: postData.externalLink || '',
    views: 0,
    createdAt: Date.now()
  };

  try {
    const docRef = await db.collection('posts').add(newPost);
    posts.unshift({ id: docRef.id, ...newPost });
    showToast('Post created successfully!');
    navigateTo('dashboard');
    return true;
  } catch (err) {
    showToast(err.message || 'Failed to create post', 'error');
    return false;
  }
}

async function markAsSold(postId) {
  if (isOperationInProgress) {
    showToast('Please wait...', 'warning');
    return;
  }

  const post = posts.find(p => p.id === postId);
  if (!post) return;

  if (!currentUser || post.ownerId !== currentUser.id) {
    showToast('You can only mark your own posts as sold', 'error');
    return;
  }

  if (post.status === 'sold') {
    showToast('This item is already sold', 'warning');
    return;
  }

  showConfirmModal(
    'Mark as Sold',
    'Are you sure you want to mark this item as sold?',
    async () => {
      isOperationInProgress = true;
      const button = document.querySelector(
        `[data-post-id="${postId}"][onclick*="markAsSold"]`
      );
      if (button) setLoading(button, true);

      try {
        await db.collection('posts').doc(postId).update({ status: 'sold' });
        post.status = 'sold';
        showToast('Item marked as sold!');
        if (currentPage === 'dashboard') {
          loadDashboard();
        } else if (currentPage === 'my-posts') {
          loadMyPosts();
        }
        closeModal('post-detail-modal');
      } catch (err) {
        showToast(err.message || 'Failed to update', 'error');
      } finally {
        isOperationInProgress = false;
        if (button) setLoading(button, false);
      }
    }
  );
}

async function deletePost(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  if (!currentUser || post.ownerId !== currentUser.id) {
    showToast('You can only delete your own posts', 'error');
    return;
  }

  showConfirmModal(
    'Delete Post',
    'Are you sure you want to delete this post? This action cannot be undone.',
    async () => {
      try {
        await db.collection('posts').doc(postId).delete();
        posts = posts.filter(p => p.id !== postId);
        showToast('Post deleted successfully');
        if (currentPage === 'my-posts') {
          loadMyPosts();
        } else {
          loadDashboard();
        }
        closeModal('post-detail-modal');
      } catch (err) {
        showToast(err.message || 'Failed to delete', 'error');
      }
    }
  );
}

// Load posts from Firestore
async function loadPostsFromFirebase() {
  const snap = await db
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .get();

  posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Load users (for owner names)
async function loadUsersForOwnerNames() {
  if (users.length === 0) initializeSampleData();
}


// ==================== FILTER / RENDER ====================

function getFilteredPosts() {
  if (!currentUser) return [];

  const searchQuery =
    document.getElementById('search-crop')?.value.toLowerCase() || '';
  const radiusFilter = parseFloat(
    document.getElementById('filter-radius')?.value || '999'
  );
  const sortBy = document.getElementById('sort-by')?.value || 'newest';

  let filtered = posts.filter(post => {
    if (searchQuery && !post.cropName.toLowerCase().includes(searchQuery)) {
      return false;
    }

    const distance = calculateDistance(
      currentUser.location.lat,
      currentUser.location.lng,
      post.location.lat,
      post.location.lng
    );
    if (distance > radiusFilter) return false;

    return true;
  });

  filtered = filtered.map(post => ({
    ...post,
    distance: calculateDistance(
      currentUser.location.lat,
      currentUser.location.lng,
      post.location.lat,
      post.location.lng
    )
  }));

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return a.distance - b.distance;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
      default:
        return b.createdAt - a.createdAt;
    }
  });

  return filtered;
}

function renderPostCard(post) {
  const owner = users.find(u => u.id === post.ownerId);
  const isOwner = currentUser && post.ownerId === currentUser.id;

  const statusLabels = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'SOLD / বিক্রি হয়েছে'
  };

  const imageHtml =
    post.images && post.images.length > 0
      ? `<img src="${post.images[0]}" alt="${post.cropName}" />`
      : '🌱';

  return `
    <div class="post-card" onclick="showPostDetail('${post.id}')">
      <div class="status-badge ${post.status}">
        ${statusLabels[post.status] || post.status}
      </div>
      <div class="post-card-image">
        ${imageHtml}
      </div>
      <div class="post-card-body">
        <div class="post-card-header">
          <h3 class="post-card-title">${post.cropName}</h3>
          <div class="post-card-price">${post.price} ${post.currency}</div>
        </div>
        <div class="post-card-quantity">
          ${post.quantity} ${post.unit}
        </div>
        <div class="post-card-meta">
          <div class="post-card-info">
            <span>${post.areaName}</span>
            ${
              post.distance != null
                ? `<span>• ${post.distance.toFixed(1)} km</span>`
                : ''
            }
          </div>
          <div class="post-card-info">
            <span>${owner ? owner.username : 'Unknown'}</span>
          </div>
          <div class="post-card-info">
            <span>${getRelativeTime(post.createdAt)}</span>
          </div>
        </div>
        ${
          isOwner
            ? `
          <div class="post-card-actions" onclick="event.stopPropagation()">
            ${
              post.status !== 'sold'
                ? `<button class="btn btn-primary btn-sm" data-post-id="${post.id}" onclick="markAsSold('${post.id}')">Mark as Sold</button>`
                : ''
            }
            <button class="btn btn-danger btn-sm" onclick="deletePost('${post.id}')">Delete</button>
          </div>
        `
            : ''
        }
      </div>
    </div>
  `;
}

async function loadDashboard() {
  const postsGrid = document.getElementById('posts-grid');
  const emptyState = document.getElementById('empty-state');

  await loadPostsFromFirebase();
  await loadUsersForOwnerNames();

  const filteredPosts = getFilteredPosts();

  if (filteredPosts.length === 0) {
    postsGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    postsGrid.innerHTML = filteredPosts.map(renderPostCard).join('');
  }
}

async function loadMyPosts() {
  if (!currentUser || currentUser.isGuest) {
    showGuestModal();
    return;
  }

  const myPostsGrid = document.getElementById('my-posts-grid');
  const emptyState = document.getElementById('my-posts-empty');
  const activeFilter =
    document.querySelector('.tab-btn.active')?.dataset.filter || 'all';

  await loadPostsFromFirebase();
  await loadUsersForOwnerNames();

  const myPosts = posts.filter(p => p.ownerId === currentUser.id);
  let filteredPosts = myPosts;

  if (activeFilter !== 'all') {
    filteredPosts = myPosts.filter(p => p.status === activeFilter);
  }

  document.getElementById('total-posts').textContent = myPosts.length;
  document.getElementById('active-posts').textContent = myPosts.filter(
    p => p.status === 'available'
  ).length;
  document.getElementById('sold-posts').textContent = myPosts.filter(
    p => p.status === 'sold'
  ).length;

  if (filteredPosts.length === 0) {
    myPostsGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    myPostsGrid.innerHTML = filteredPosts
      .map(post => renderPostCard({ ...post, distance: 0 }))
      .join('');
  }
}

function loadProfile() {
  if (!currentUser || currentUser.isGuest) {
    showGuestModal();
    return;
  }

  document.getElementById('profile-username').value = currentUser.username;
  document.getElementById('profile-email').value = currentUser.email;
  document.getElementById('profile-phone').value = currentUser.phone || '';
  document.getElementById('profile-phone-visible').checked =
    currentUser.phoneVisible ?? true;
  document.getElementById('profile-area').value = currentUser.areaName;

  if (currentUser.avatar) {
    document.getElementById('avatar-img').src = currentUser.avatar;
    document.getElementById('avatar-img').classList.remove('hidden');
    document.getElementById('avatar-placeholder').classList.add('hidden');
  } else {
    document.getElementById('avatar-img').classList.add('hidden');
    document.getElementById('avatar-placeholder').classList.remove('hidden');
  }
}

async function showPostDetail(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const owner = users.find(u => u.id === post.ownerId);
  const isOwner = currentUser && post.ownerId === currentUser.id;
  const canContact = currentUser && !currentUser.isGuest && post.status !== 'sold';

  const statusLabels = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'SOLD / বিক্রি হয়েছে'
  };

  const imagesHtml =
    post.images && post.images.length > 0
      ? `<img src="${post.images[0]}" alt="${post.cropName}" />`
      : `<div style="display:flex;align-items:center;justify-content:center;font-size:64px;">🌱</div>`;

  const phoneDisplay =
    owner && owner.phoneVisible && currentUser && !currentUser.isGuest
      ? `<div class="post-card-info">${owner.phone}</div>`
      : `<div class="post-card-info">Phone hidden</div>`;

  const content = `
    <div class="post-detail">
      <div class="post-detail-images">
        <div class="post-detail-main-image">
          ${imagesHtml}
        </div>
      </div>
      <div class="post-detail-info">
        <div class="status-badge ${post.status}">
          ${statusLabels[post.status] || post.status}
        </div>
        <h2>${post.cropName}</h2>
        <div class="post-detail-price">${post.price} ${post.currency}</div>
        <div class="post-card-quantity">${post.quantity} ${post.unit}</div>
        <div class="post-detail-description">${post.description}</div>

        <div class="post-detail-meta">
          <div class="post-card-info">${post.areaName}</div>
          <div class="post-card-info">${getRelativeTime(post.createdAt)}</div>
        </div>

        <div class="seller-info">
          <h4>Seller Information</h4>
          <div class="post-card-info">${owner ? owner.username : 'Unknown'}</div>
          <div class="post-card-info">${owner ? owner.areaName : 'Unknown'}</div>
          ${phoneDisplay}
        </div>

        <div style="display:flex;gap:12px;margin-top:20px;">
          ${
            isOwner && post.status !== 'sold'
              ? `<button class="btn btn-primary" data-post-id="${post.id}" onclick="markAsSold('${post.id}')">Mark as Sold</button>`
              : ''
          }
          ${
            isOwner
              ? `<button class="btn btn-danger" onclick="deletePost('${post.id}')">Delete</button>`
              : ''
          }
          ${
            !isOwner && canContact
              ? `<button class="btn btn-primary" onclick="contactSeller('${owner?.id}')"${
                  post.status === 'sold' ? ' disabled' : ''
                }>Contact Seller</button>`
              : ''
          }
          ${
            !isOwner && (!currentUser || currentUser.isGuest)
              ? `<button class="btn btn-primary" onclick="showGuestModal()">Sign in to Contact</button>`
              : ''
          }
        </div>
      </div>
    </div>
  `;

  document.getElementById('post-detail-content').innerHTML = content;
  showModal('post-detail-modal');
}

function contactSeller(sellerId) {
  showToast('Contact feature simulated! In production, this would open a chat.');
}


// ==================== MODALS ====================

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function showGuestModal() {
  showModal('guest-modal');
}

function showConfirmModal(title, message, onConfirm) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;

  const confirmBtn = document.getElementById('confirm-ok');
  const cancelBtn = document.getElementById('confirm-cancel');

  const newConfirmBtn = confirmBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);

  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

  newConfirmBtn.addEventListener('click', async () => {
    closeModal('confirm-modal');
    await onConfirm();
  });
  newCancelBtn.addEventListener('click', () => closeModal('confirm-modal'));

  showModal('confirm-modal');
}


// ==================== EVENT LISTENERS ====================

function initializeEventListeners() {
  // Login
  document
    .getElementById('login-form')
    ?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const button = e.target.querySelector('button[type="submit"]');
      setLoading(button, true);
      await firebaseLogin(email, password);
      setLoading(button, false);
    });

  // Signup
  document
    .getElementById('signup-form')
    ?.addEventListener('submit', async e => {
      e.preventDefault();
      const userData = {
        username: document.getElementById('signup-username').value,
        email: document.getElementById('signup-email').value,
        password: document.getElementById('signup-password').value,
        phone: document.getElementById('signup-phone').value,
        areaName: document.getElementById('signup-area').value
      };
      const button = e.target.querySelector('button[type="submit"]');
      setLoading(button, true);
      await firebaseSignup(userData);
      setLoading(button, false);
    });

  // Guest login
  document
    .getElementById('guest-login-btn')
    ?.addEventListener('click', handleGuestLogin);

  // Show signup/login
  document.getElementById('show-signup')?.addEventListener('click', e => {
    e.preventDefault();
    navigateTo('signup');
  });
  document.getElementById('show-login')?.addEventListener('click', e => {
    e.preventDefault();
    navigateTo('login');
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.dataset.page;
      if (
        currentUser?.isGuest &&
        (page === 'create-post' || page === 'my-posts' || page === 'profile')
      ) {
        showGuestModal();
      } else {
        navigateTo(page);
      }
    });
  });

  // Create post form
  document
    .getElementById('create-post-form')
    ?.addEventListener('submit', async e => {
      e.preventDefault();
      const postData = {
        cropName: document.getElementById('post-crop-name').value,
        price: document.getElementById('post-price').value,
        currency: document.getElementById('post-currency').value,
        quantity: document.getElementById('post-quantity').value,
        unit: document.getElementById('post-unit').value,
        description: document.getElementById('post-description').value,
        externalLink: document.getElementById('post-link').value,
        images: window.postImages
      };
      const button = e.target.querySelector('button[type="submit"]');
      setLoading(button, true);
      await createPost(postData);
      setLoading(button, false);
      e.target.reset();
      document.getElementById('image-preview').innerHTML = '';
      window.postImages = [];
    });

  document
    .getElementById('cancel-post-btn')
    ?.addEventListener('click', () => {
      document.getElementById('create-post-form').reset();
      document.getElementById('image-preview').innerHTML = '';
      window.postImages = [];
      navigateTo('dashboard');
    });

  // Image upload
  document.getElementById('post-images')?.addEventListener('change', e => {
    const files = e.target.files;
    const preview = document.getElementById('image-preview');
    window.postImages = window.postImages || [];

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        window.postImages.push(event.target.result);
        const idx = window.postImages.length - 1;
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-preview-item';
        imgContainer.innerHTML = `
          <img src="${event.target.result}" alt="Preview" />
          <button type="button" class="image-preview-remove" data-index="${idx}">&times;</button>
        `;
        preview.appendChild(imgContainer);

        imgContainer
          .querySelector('.image-preview-remove')
          .addEventListener('click', function () {
            const index = parseInt(this.dataset.index, 10);
            window.postImages.splice(index, 1);
            imgContainer.remove();
          });
      };
      reader.readAsDataURL(file);
    });
  });

  // Profile form
  document
    .getElementById('profile-form')
    ?.addEventListener('submit', async e => {
      e.preventDefault();
      if (!currentUser || currentUser.isGuest) return;

      currentUser.username =
        document.getElementById('profile-username').value;
      currentUser.phone = document.getElementById('profile-phone').value;
      currentUser.phoneVisible =
        document.getElementById('profile-phone-visible').checked;

      try {
        await db.collection('users').doc(currentUser.id).update({
          username: currentUser.username,
          phone: currentUser.phone,
          phoneVisible: currentUser.phoneVisible
        });
        showToast('Profile updated successfully!');
      } catch (err) {
        showToast(err.message || 'Failed to update profile', 'error');
      }
    });

  // Avatar upload
  document
    .getElementById('change-avatar-btn')
    ?.addEventListener('click', () => {
      document.getElementById('avatar-upload').click();
    });

  document
    .getElementById('avatar-upload')
    ?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file || !currentUser || currentUser.isGuest) return;

      const reader = new FileReader();
      reader.onload = async event => {
        currentUser.avatar = event.target.result;
        document.getElementById('avatar-img').src = event.target.result;
        document
          .getElementById('avatar-img')
          .classList.remove('hidden');
        document.getElementById('avatar-placeholder').style.display = 'none';

        try {
          await db.collection('users').doc(currentUser.id).update({
            avatar: currentUser.avatar
          });
          showToast('Avatar updated!');
        } catch (err) {
          showToast(err.message || 'Failed to update avatar', 'error');
        }
      };
      reader.readAsDataURL(file);
    });

  // Filters
  document
    .getElementById('search-crop')
    ?.addEventListener('input', loadDashboard);
  document
    .getElementById('filter-radius')
    ?.addEventListener('change', loadDashboard);
  document
    .getElementById('sort-by')
    ?.addEventListener('change', loadDashboard);

  // My posts filter tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b =>
        b.classList.remove('active')
      );
      btn.classList.add('active');
      loadMyPosts();
    });
  });

  // Modal close
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal').classList.add('hidden');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
      overlay.closest('.modal').classList.add('hidden');
    });
  });

  // Guest modal buttons
  document
    .getElementById('guest-modal-signup')
    ?.addEventListener('click', () => {
      closeModal('guest-modal');
      navigateTo('signup');
    });
  document
    .getElementById('guest-modal-login')
    ?.addEventListener('click', () => {
      closeModal('guest-modal');
      navigateTo('login');
    });

  // Buttons with data-page (inside content)
  document.querySelectorAll('[data-page]').forEach(btn => {
    if (!btn.classList.contains('nav-link')) {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        navigateTo(page);
      });
    }
  });
}


// ==================== INITIALIZATION ====================

async function init() {
  initializeSampleData();
  initializeEventListeners();
  navigateTo('login');

  console.log('ChadKrishi initialized!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
