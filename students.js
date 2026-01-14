const API_BASE = 'http://localhost:3000';

let allStudents = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Students page loaded');
    
    // Initialize
    fetchStudents();
    
    // Setup search if search input exists
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        setupSearch(searchInput);
    }
});

// Setup search functionality
function setupSearch(searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            displayStudents(allStudents);
            return;
        }
        
        const filteredStudents = allStudents.filter(student => {
            return (
                (student.first_name && student.first_name.toLowerCase().includes(searchTerm)) ||
                (student.last_name && student.last_name.toLowerCase().includes(searchTerm)) ||
                (student.email && student.email.toLowerCase().includes(searchTerm)) ||
                (student.phone && student.phone.includes(searchTerm)) ||
                (student.company && student.company.toLowerCase().includes(searchTerm))
            );
        });
        
        displayStudents(filteredStudents);
    });
}

// Fetch all students
async function fetchStudents() {
    try {
        console.log('📥 Fetching students from server...');
        const response = await fetch(`${API_BASE}/api/students`);
        
        if (response.ok) {
            allStudents = await response.json();
            console.log(`✅ Fetched ${allStudents.length} students`);
            
            // Update student count
            const studentCountLabel = document.getElementById('studentCount');
            if (studentCountLabel) {
                studentCountLabel.textContent = allStudents.length;
            }
            
            displayStudents(allStudents);
        } else {
            throw new Error(`Server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error fetching students:', error);
        showError('Failed to load students. Please check your connection.');
    }
}

// Display students
function displayStudents(students) {
    const cardsContainer = document.getElementById('cardsContainer');
    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = '';
    
    if (students.length === 0) {
        cardsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">
                <p>No students found</p>
                <p style="font-size: 14px; margin-top: 10px;">
                    ${allStudents.length === 0 ? 'Register a student to see them here' : 'Try a different search term'}
                </p>
            </div>
        `;
        return;
    }
    
    console.log(`🎨 Displaying ${students.length} students`);
    
    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'facecard';
        
        // Create avatar as IMG tag
        const avatar = document.createElement('img');
        avatar.className = 'avatar-img';
        
        // Use photo if exists, otherwise generate avatar
        let photoSrc = student.photo;
        
        if (!photoSrc || photoSrc === 'null' || photoSrc === '' || photoSrc === null) {
            // Generate DiceBear avatar URL
            const seed = encodeURIComponent(`${student.first_name}${student.last_name}${student.id}`);
            photoSrc = `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}`;
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
        
        const info = document.createElement('div');
        info.className = 'info';
        
        info.innerHTML = `
            <h4>${student.first_name} ${student.last_name}</h4>
            ${student.company ? `<div class="company">🏢 ${student.company}</div>` : ''}
            <div class="contacts">
                <div>📞 ${student.phone}</div>
                ${student.alt_phone ? `<div>📱 ${student.alt_phone}</div>` : ''}
                ${student.email ? `<div>📧 ${student.email}</div>` : ''}
            </div>
            <div class="meta">
                Registered: ${new Date(student.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </div>
        `;
        
        card.appendChild(avatar);
        card.appendChild(info);
        cardsContainer.appendChild(card);
    });
}

// Show error message
function showError(message) {
    const cardsContainer = document.getElementById('cardsContainer');
    if (cardsContainer) {
        cardsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ff6b6b;">
                <p>Error: ${message}</p>
                <p style="font-size: 14px; margin-top: 10px;">Please check your connection and try again.</p>
            </div>
        `;
    }
    
    const studentCountLabel = document.getElementById('studentCount');
    if (studentCountLabel) {
        studentCountLabel.textContent = '0';
    }
}