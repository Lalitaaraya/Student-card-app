const API_BASE = 'http://localhost:3000';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Form page loaded');
    
    // Initialize
    fetchStudentCount();
    fetchRecentStudents();
    
    // Setup photo preview
    setupPhotoPreview();
    
    // Setup form submission
    setupFormSubmission();
    
    // Test avatar generation
    testAvatarGeneration();
});

// Test avatar generation
function testAvatarGeneration() {
    console.log('🧪 Testing avatar generation...');
    
    // Test direct URL
    const testUrl = 'https://api.dicebear.com/7.x/avataaars/png?seed=test123';
    const img = new Image();
    img.onload = () => console.log('✅ DiceBear avataaars PNG works!');
    img.onerror = () => console.error('❌ DiceBear avataaars PNG failed');
    img.src = testUrl;
}

// Setup photo preview
function setupPhotoPreview() {
    const photoInput = document.getElementById('photoUpload');
    const preview = document.getElementById('photoPreview');
    
    if (photoInput && preview) {
        photoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(this.files[0]);
            } else {
                preview.style.display = 'none';
            }
        });
    }
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('signupForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const registerBtn = document.getElementById('registerBtn');
        const originalText = registerBtn.textContent;
        
        // Disable button and show loading
        registerBtn.disabled = true;
        registerBtn.textContent = 'Registering...';
        
        // Clear previous errors
        clearErrors();
        
        // Validate form
        if (!validateForm()) {
            registerBtn.disabled = false;
            registerBtn.textContent = originalText;
            return;
        }
        
        try {
            // Prepare form data
            const formData = {
                first_name: document.getElementById('first_name').value.trim(),
                middle_name: document.getElementById('middle_name').value.trim() || null,
                last_name: document.getElementById('last_name').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                alt_phone: document.getElementById('alt_phone').value.trim() || null,
                email: document.getElementById('email').value.trim(),
                company: document.getElementById('company').value.trim() || null
            };
            
            console.log('📤 Sending data:', formData);
            
            // Handle photo upload
            const photoInput = document.getElementById('photoUpload');
            if (photoInput.files && photoInput.files[0]) {
                try {
                    // Convert to base64
                    formData.photo = await fileToBase64(photoInput.files[0]);
                    console.log('📸 Photo included');
                } catch (error) {
                    console.error('Error processing photo:', error);
                    showError('photoUpload', 'Failed to process image');
                    registerBtn.disabled = false;
                    registerBtn.textContent = originalText;
                    return;
                }
            }
            
            // Send to server
            const response = await fetch(`${API_BASE}/api/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Registration successful:', result);
                
                // Show success message
                showSuccess();
                
                // Reset form
                form.reset();
                const preview = document.getElementById('photoPreview');
                if (preview) {
                    preview.style.display = 'none';
                }
                
                // Refresh data
                fetchStudentCount();
                fetchRecentStudents();
                
                // Auto-redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'students.html';
                }, 2000);
                
            } else {
                throw new Error(result.error || 'Registration failed');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            // Re-enable button
            registerBtn.disabled = false;
            registerBtn.textContent = originalText;
        }
    });
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Validate form
function validateForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        { id: 'first_name', name: 'First Name' },
        { id: 'last_name', name: 'Last Name' },
        { id: 'phone', name: 'Phone Number' },
        { id: 'email', name: 'Email' }
    ];
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input.value.trim()) {
            showError(field.id, `${field.name} is required`);
            isValid = false;
        }
    });
    
    // Phone validation (10 digits)
    const phone = document.getElementById('phone').value.trim();
    if (phone && !/^\d{10}$/.test(phone)) {
        showError('phone', 'Phone must be exactly 10 digits');
        isValid = false;
    }
    
    // Alternate phone validation
    const altPhone = document.getElementById('alt_phone').value.trim();
    if (altPhone && !/^\d{10}$/.test(altPhone)) {
        showError('alt_phone', 'Alternate phone must be exactly 10 digits');
        isValid = false;
    }
    
    // Email validation
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // File size validation (5MB)
    const photoInput = document.getElementById('photoUpload');
    if (photoInput.files && photoInput.files[0]) {
        const fileSize = photoInput.files[0].size;
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (fileSize > maxSize) {
            showError('photoUpload', 'File size must be less than 5MB');
            isValid = false;
        }
        
        // File type validation
        const fileType = photoInput.files[0].type;
        if (!fileType.startsWith('image/')) {
            showError('photoUpload', 'Please upload an image file');
            isValid = false;
        }
    }
    
    return isValid;
}

// Show error for a field
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        
        let errorMsg = field.parentElement.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            field.parentElement.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    } else {
        // General form error
        alert(`Error: ${message}`);
    }
}

// Clear all errors
function clearErrors() {
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
    
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
}

// Show success message
function showSuccess() {
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
        successMsg.style.display = 'block';
    }
}

// Fetch student count
async function fetchStudentCount() {
    try {
        const response = await fetch(`${API_BASE}/api/students/count`);
        if (response.ok) {
            const data = await response.json();
            const countElement = document.getElementById('studentCount');
            if (countElement) {
                countElement.textContent = data.count;
            }
        }
    } catch (error) {
        console.error('Error fetching count:', error);
        const countElement = document.getElementById('studentCount');
        if (countElement) {
            countElement.textContent = '0';
        }
    }
}

// Fetch recent students (for form page)
async function fetchRecentStudents() {
    try {
        const response = await fetch(`${API_BASE}/api/students`);
        if (response.ok) {
            const students = await response.json();
            displayRecentStudents(students.slice(0, 3)); // Show only 3 recent students
        }
    } catch (error) {
        console.error('Error fetching recent students:', error);
        displayRecentStudents([]);
    }
}

// Display recent students on form page
function displayRecentStudents(students) {
    const cardsContainer = document.getElementById('cardsContainer');
    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = '';
    
    if (students.length === 0) {
        cardsContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);">
                <p>No students registered yet</p>
                <p style="font-size: 14px; margin-top: 10px;">Be the first to register!</p>
            </div>
        `;
        return;
    }
    
    console.log(`👥 Displaying ${students.length} recent students`);
    
    students.forEach(student => {
        console.log('Student:', student);
        
        const card = document.createElement('div');
        card.className = 'facecard';
        
        // Create avatar as IMG tag
        const avatar = document.createElement('img');
        avatar.className = 'avatar-img';
        
        // Use photo if exists, otherwise generate avatar
        let photoSrc = student.photo;
        
        if (!photoSrc || photoSrc === 'null' || photoSrc === '' || photoSrc === null) {
            // Generate DiceBear avatar URL
            const seed = encodeURIComponent(`${student.first_name}${student.last_name}${student.id || Date.now()}`);
            photoSrc = `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}`;
            console.log('Generated avatar for student:', photoSrc);
        }
        
        avatar.src = photoSrc;
        avatar.alt = `${student.first_name} ${student.last_name}`;
        
        // Add error handling for avatar
        avatar.onerror = function() {
            console.error('Failed to load avatar:', photoSrc);
            // Fallback to a default avatar
            const fallbackSeed = encodeURIComponent(`${student.first_name}${student.last_name}fallback`);
            this.src = `https://api.dicebear.com/7.x/avataaars/png?seed=${fallbackSeed}`;
        };
        
        avatar.onload = function() {
            console.log('✅ Avatar loaded successfully:', photoSrc);
        };
        
        const info = document.createElement('div');
        info.className = 'info';
        
        info.innerHTML = `
            <h4>${student.first_name} ${student.last_name}</h4>
            ${student.company ? `<div class="company">🏢 ${student.company}</div>` : ''}
            <div class="contacts">
                <div>📞 ${student.phone}</div>
                ${student.email ? `<div>📧 ${student.email}</div>` : ''}
            </div>
            <div class="meta">
                Registered: ${new Date(student.created_at).toLocaleDateString()}
            </div>
        `;
        
        card.appendChild(avatar);
        card.appendChild(info);
        cardsContainer.appendChild(card);
    });
}

// Check server health
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        if (response.ok) {
            console.log('✅ Server is healthy');
        } else {
            console.warn('⚠️ Server health check failed');
        }
    } catch (error) {
        console.error('❌ Server connection error:', error);
    }
}

// Initial server check
checkServerHealth();