import './style.css'

// Format relative time helper
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMins = Math.floor(diffInMs / 60000);

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};
document.addEventListener('DOMContentLoaded', () => {
  const themeTogglebtn = document.getElementById('theme-toggle');
  const icon = themeTogglebtn.querySelector('i');

  // Theme management
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    icon.classList.replace('fa-moon', 'fa-sun');
  }

  themeTogglebtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      icon.classList.replace('fa-sun', 'fa-moon');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      icon.classList.replace('fa-moon', 'fa-sun');
    }
  });

  // Adding basic interactivity and smooth scrolling to navigation links
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('a.active')?.classList.remove('active');
      link.classList.add('active');

      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        // Offset for the sticky navbar
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Modal Management
  const createPostBtn = document.querySelector('.btn-community');
  const createPostModal = document.getElementById('createPostModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelPostBtn = document.getElementById('cancelPostBtn');
  const submitPostBtn = document.getElementById('submitPostBtn');
  const createPostForm = document.getElementById('createPostForm');

  const openModal = () => createPostModal.classList.add('active');
  const closeModal = () => {
    createPostModal.classList.remove('active');
    createPostForm.reset();
  };

  if (createPostBtn && createPostModal) {
    createPostBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelPostBtn.addEventListener('click', closeModal);

    // Close modal on outside click
    createPostModal.addEventListener('click', (e) => {
      if (e.target === createPostModal) {
        closeModal();
      }
    });

    submitPostBtn.addEventListener('click', async (e) => {
      if (createPostForm.checkValidity()) {
        e.preventDefault();

        try {
          const category = document.getElementById('postCategory').value;
          const content = document.getElementById('postContent').value;

          const response = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, content })
          });

          const data = await response.json();
          if (response.ok) {
            alert(data.message);
            closeModal();
            loadPosts(); // Refresh posts to show the newly created one
          } else {
            alert(data.error || 'Failed to publish post.');
          }
        } catch (error) {
          console.error(error);
          alert('Error connecting to the server.');
        }
      } else {
        createPostForm.reportValidity();
      }
    });
  }

  // Weather Logic
  const initWeather = async () => {
    const getWeatherIconAndCondition = (code) => {
      // WMO Weather interpretation codes
      if (code === 0) return { condition: 'Clear Sky', icon: 'fa-sun', color: '#f59e0b' };
      if (code === 1 || code === 2 || code === 3) return { condition: 'Partly Cloudy', icon: 'fa-cloud-sun', color: '#f59e0b' };
      if (code >= 45 && code <= 48) return { condition: 'Fog', icon: 'fa-smog', color: '#94a3b8' };
      if (code >= 51 && code <= 67) return { condition: 'Rain', icon: 'fa-cloud-rain', color: '#3b82f6' };
      if (code >= 71 && code <= 77) return { condition: 'Snow', icon: 'fa-snowflake', color: '#93c5fd' };
      if (code >= 80 && code <= 82) return { condition: 'Heavy Rain', icon: 'fa-cloud-showers-heavy', color: '#2563eb' };
      if (code >= 95) return { condition: 'Thunderstorm', icon: 'fa-cloud-bolt', color: '#64748b' };
      return { condition: 'Cloudy', icon: 'fa-cloud', color: '#94a3b8' }; 
    };

    const getDayName = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    const fetchWeatherData = async (lat, lon, locationName = "Your Farm Location") => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        
        if (!res.ok) throw new Error('Network response not ok');
        const data = await res.json();
        
        const locationEl = document.getElementById('locationName');
        const currentTempEl = document.getElementById('currentTemp');
        const currentHumidityEl = document.getElementById('currentHumidity');
        const currentWindEl = document.getElementById('currentWind');
        const currentConditionEl = document.getElementById('currentCondition');
        const currentWeatherIcon = document.getElementById('currentWeatherIcon');
        
        if (locationEl) locationEl.textContent = locationName;
        
        const current = data.current;
        if (current) {
          const w = getWeatherIconAndCondition(current.weather_code);
          if (currentTempEl) currentTempEl.innerHTML = `${Math.round(current.temperature_2m)}°`;
          if (currentHumidityEl) currentHumidityEl.innerHTML = `${current.relative_humidity_2m}%`;
          if (currentWindEl) currentWindEl.innerHTML = `${Math.round(current.wind_speed_10m)} km/h`;
          if (currentConditionEl) currentConditionEl.textContent = w.condition;
          
          if (currentWeatherIcon) {
            currentWeatherIcon.className = `fa-solid ${w.icon} fa-2x weather-icon-main`;
            currentWeatherIcon.style.color = w.color;
          }
        }
        
        const daily = data.daily;
        const forecastContainer = document.getElementById('forecastContainer');
        if (forecastContainer && daily && daily.time.length >= 4) {
          forecastContainer.innerHTML = '';
          for (let i = 1; i <= 3; i++) {
            const dateStr = daily.time[i];
            const max = Math.round(daily.temperature_2m_max[i]);
            const min = Math.round(daily.temperature_2m_min[i]);
            const w = getWeatherIconAndCondition(daily.weather_code[i]);
            
            const dayName = i === 1 ? 'Tomorrow' : getDayName(dateStr);
            
            const dayEl = document.createElement('div');
            dayEl.className = 'forecast-day';
            dayEl.innerHTML = `
              <h4>${dayName}</h4>
              <i class="fa-solid ${w.icon}" style="color: ${w.color};"></i>
              <p>${max}° / ${min}°</p>
            `;
            forecastContainer.appendChild(dayEl);
          }
        }
      } catch (err) {
        console.error('Weather Fetch Error: ', err);
        const forecastContainer = document.getElementById('forecastContainer');
        if (forecastContainer) {
          forecastContainer.innerHTML = '<p style="text-align:center;color:red;padding:2rem;">Failed to load forecast data.</p>';
        }
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          let locationStr = "Your Farm Location";
          
          try {
            const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const nomData = await nomRes.json();
            if (nomData && nomData.address) {
              const city = nomData.address.city || nomData.address.town || nomData.address.village || nomData.address.county;
              const state = nomData.address.state;
              if (city && state) locationStr = `${city}, ${state}`;
              else if (city) locationStr = city;
            }
          } catch (e) {
             console.warn("Reverse geocode failed", e);
          }
          fetchWeatherData(lat, lon, locationStr);
        },
        (error) => {
          console.warn('Geolocation blocked. Using default coords (New Delhi).', error);
          fetchWeatherData(28.6139, 77.2090, "New Delhi, Delhi");
        },
        { timeout: 10000 }
      );
    } else {
      fetchWeatherData(28.6139, 77.2090, "New Delhi, Delhi");
    }
  };

  initWeather();

  let currentReplyPostId = null;

  // Load Posts Function
  const loadPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      if (response.ok) {
        const posts = await response.json();
        const container = document.querySelector('.community-container');

        if (!container) return;

        // Remove existing detail cards to re-render fresh
        const existingPosts = container.querySelectorAll('.detail-card');
        existingPosts.forEach(post => post.remove());

        // Find the CTA card to insert posts before it
        const ctaCard = container.querySelector('.primary-card');

        // Add all fetched posts
        posts.forEach(post => {
          const postElement = document.createElement('div');
          postElement.className = 'community-card detail-card glassmorphism';

          postElement.innerHTML = `
            <div class="community-header">
              <div class="avatar-icon"><i class="fa-solid fa-user-tie"></i></div>
              <div>
                <h4>${post.authorName || 'Anonymous Farmer'} <span><small>(${post.category})</small></span></h4>
                <span>Active ${getRelativeTime(post.createdAt)}</span>
              </div>
            </div>
            <p class="community-post">"${post.content}"</p>

            ${(post.replies && post.replies.length > 0) ? `
              <div class="replies-container">
                ${post.replies.map(reply => `
                  <div class="reply-card">
                    <div class="reply-header">
                      <strong>${reply.authorName}</strong>
                      <span>${getRelativeTime(reply.createdAt)}</span>
                    </div>
                    <p class="reply-content">${reply.content}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="community-actions">
              <button class="like-btn"><i class="fa-regular fa-thumbs-up"></i> <span>${post.likes || 0}</span> Likes</button>
              <button class="answer-btn"><i class="fa-regular fa-comment"></i> <span>${post.replies ? post.replies.length : 0}</span> Replies</button>
            </div>
          `;

          if (ctaCard) {
            container.insertBefore(postElement, ctaCard);
          } else {
            container.appendChild(postElement);
          }

          // Button Interactions
          const likeBtn = postElement.querySelector('.like-btn');
          const answerBtn = postElement.querySelector('.answer-btn');

          likeBtn.addEventListener('click', async () => {
            try {
              const res = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, { method: 'PUT' });
              if (res.ok) {
                const updatedPost = await res.json();
                likeBtn.querySelector('span').textContent = updatedPost.likes;
                likeBtn.style.color = 'var(--color-primary)';
                likeBtn.style.borderColor = 'var(--color-primary)';
              }
            } catch (err) {
              console.error('Liking failed:', err);
            }
          });

          answerBtn.addEventListener('click', () => {
            currentReplyPostId = post._id;
            const replyPostModal = document.getElementById('replyPostModal');
            if (replyPostModal) replyPostModal.classList.add('active');
          });
        });
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  // Call loadPosts on page load
  loadPosts();

  // Modal & User Account References
  const loginBtn = document.getElementById('loginBtn');
  const getStartedBtn = document.getElementById('getStartedBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
  const cancelLoginBtn = document.getElementById('cancelLoginBtn');
  const submitLoginBtn = document.getElementById('submitLoginBtn');
  const loginForm = document.getElementById('loginForm');

  const accountModal = document.getElementById('accountModal');
  const closeAccountModalBtn = document.getElementById('closeAccountModalBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const accountNameLabel = document.getElementById('accountNameLabel');
  const accountEmailLabel = document.getElementById('accountEmailLabel');

  const openLoginModal = () => loginModal.classList.add('active');
  const closeLoginModal = () => {
    loginModal.classList.remove('active');
    loginForm.reset();
  };

  const openAccountModal = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      if (accountNameLabel) accountNameLabel.textContent = user.name || 'Farmer Member';
      if (accountEmailLabel) accountEmailLabel.textContent = user.email;
      accountModal.classList.add('active');
    }
  };
  const closeAccountModal = () => {
    accountModal.classList.remove('active');
  };

  // Setup UI based on login state
  const updateUserUI = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (loginBtn) {
      loginBtn.removeEventListener('click', openLoginModal);
      loginBtn.removeEventListener('click', openAccountModal);
    }

    if (user) {
      if (loginBtn) {
        loginBtn.innerHTML = '<i class="fa-solid fa-user" style="margin-right:0.4rem;"></i> Account';
        loginBtn.addEventListener('click', openAccountModal);
      }
      if (getStartedBtn) {
        getStartedBtn.innerHTML = 'Browse Services <i class="fa-solid fa-arrow-right"></i>';
        getStartedBtn.onclick = () => {
          document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
        };
      }
    } else {
      if (loginBtn) {
        loginBtn.innerHTML = 'Log In';
        loginBtn.addEventListener('click', openLoginModal);
      }
      if (getStartedBtn) {
        getStartedBtn.innerHTML = 'Get Started <i class="fa-solid fa-arrow-right"></i>';
        getStartedBtn.onclick = openLoginModal;
      }
    }
  };

  // Initialize UI State
  updateUserUI();

  if (loginModal) {
    if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', closeLoginModal);
    if (cancelLoginBtn) cancelLoginBtn.addEventListener('click', closeLoginModal);

    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) closeLoginModal();
    });

    if (submitLoginBtn) {
      submitLoginBtn.addEventListener('click', async (e) => {
        if (loginForm.checkValidity()) {
          e.preventDefault();
          try {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const response = await fetch('http://localhost:5000/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
              localStorage.setItem('user', JSON.stringify(data.user));
              closeLoginModal();
              updateUserUI();
              openAccountModal(); // Automatically open account
            } else {
              alert(data.error || 'Login failed.');
            }
          } catch (error) {
            console.error(error);
            alert('Error connecting to the server.');
          }
        } else {
          loginForm.reportValidity();
        }
      });
    }
  }

  if (accountModal) {
    if (closeAccountModalBtn) closeAccountModalBtn.addEventListener('click', closeAccountModal);
    accountModal.addEventListener('click', (e) => {
      if (e.target === accountModal) closeAccountModal();
    });
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        updateUserUI();
        closeAccountModal();
      });
    }
  }

  // Reply Post Modal Management
  const replyPostModal = document.getElementById('replyPostModal');
  const closeReplyModalBtn = document.getElementById('closeReplyModalBtn');
  const cancelReplyBtn = document.getElementById('cancelReplyBtn');
  const submitReplyBtn = document.getElementById('submitReplyBtn');
  const replyPostContent = document.getElementById('replyPostContent');

  const closeReplyModal = () => {
    if (replyPostModal) {
      replyPostModal.classList.remove('active');
      document.getElementById('replyPostForm')?.reset();
    }
  };

  if (replyPostModal) {
    if (closeReplyModalBtn) closeReplyModalBtn.addEventListener('click', closeReplyModal);
    if (cancelReplyBtn) cancelReplyBtn.addEventListener('click', closeReplyModal);
    replyPostModal.addEventListener('click', (e) => {
      if (e.target === replyPostModal) closeReplyModal();
    });

    if (submitReplyBtn) {
      submitReplyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const answer = replyPostContent.value;
        if (answer && answer.trim() !== '' && currentReplyPostId) {
          try {
            const user = JSON.parse(localStorage.getItem('user'));
            const payload = {
              content: answer,
              authorName: user ? (user.name || 'Farmer Member') : 'Anonymous Farmer'
            };
            const res = await fetch(`http://localhost:5000/api/posts/${currentReplyPostId}/answer`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              closeReplyModal();
              loadPosts(); // Reload to fetch fresh counts
            }
          } catch (err) {
            console.error('Replying failed:', err);
          }
        }
      });
    }
  }

  // Hamburger Menu Logic
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navbar = document.querySelector('.navbar');

  if (hamburgerBtn && navbar) {
    hamburgerBtn.addEventListener('click', () => {
      navbar.classList.toggle('active');
      const icon = hamburgerBtn.querySelector('i');
      if (navbar.classList.contains('active')) {
        icon.classList.replace('fa-bars', 'fa-xmark');
      } else {
        icon.classList.replace('fa-xmark', 'fa-bars');
      }
    });

    // Close mobile menu when clicking a navigation link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navbar.classList.contains('active')) {
          navbar.classList.remove('active');
          const icon = hamburgerBtn.querySelector('i');
          icon.classList.replace('fa-xmark', 'fa-bars');
        }
      });
    });
  }

  // Service Booking Buttons
  const serviceBtns = document.querySelectorAll('.btn-service');
  serviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceName = btn.getAttribute('data-service');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Booking...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (user) {
          alert(`Success! You have initiated a booking request for: ${serviceName}. Our team will contact you shortly at ${user.email}.`);
        } else {
           alert(`Please log in first to book the ${serviceName} service.`);
           document.getElementById('loginModal')?.classList.add('active');
        }
      }, 600);
    });
  });

  // Store Purchase Buttons
  const storeBtns = document.querySelectorAll('.btn-store');
  storeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productName = btn.getAttribute('data-product');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (user) {
          alert(`Success! You have added ${productName} to your cart. Please proceed to checkout when ready.`);
        } else {
           alert(`Please log in first to purchase ${productName}.`);
           document.getElementById('loginModal')?.classList.add('active');
        }
      }, 500);
    });
  });

  // Schemes Buttons
  const schemeUrls = {
    'PM-KISAN': 'https://pmkisan.gov.in/',
    'PMFBY': 'https://pmfby.gov.in/',
    'Kisan Credit Card': 'https://www.myscheme.gov.in/schemes/kcc',
    'Soil Health Card': 'https://soilhealth.dac.gov.in/',
    'e-NAM Portal': 'https://www.enam.gov.in/',
    'PKVY Organic Farming': 'https://pgsindia-ncof.gov.in/pkvy/'
  };

  const schemeBtns = document.querySelectorAll('.btn-scheme');
  schemeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const schemeName = btn.getAttribute('data-scheme');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Redirecting...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (user) {
          const url = schemeUrls[schemeName] || 'https://www.myscheme.gov.in/';
          window.open(url, '_blank');
        } else {
           alert(`Please securely log in to your account first before applying for ${schemeName}.`);
           document.getElementById('loginModal')?.classList.add('active');
        }
      }, 500);
    });
  });

});
