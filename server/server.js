require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;

async function getPool() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'techoon',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
    return pool;
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nPossible fixes:');
      console.error('1. Check server/.env file for correct credentials');
      console.error('2. Verify MySQL is running');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('\nDatabase does not exist. Create it with:');
      console.error("CREATE DATABASE techoon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    }
    
    throw err;
  }
}

// Function to generate DiceBear human avatar (using PNG format)
// Accepts optional seedOverride to deterministically generate avatar from image hash or other seed
function generateHumanAvatar(firstName, lastName, seedOverride) {
  try {
    // Use provided seedOverride if present, otherwise create a seed from the user's name
    const seed = seedOverride || `${firstName || 'user'}${lastName || Math.random().toString(36).substring(2)}`;
    const encodedSeed = encodeURIComponent(seed);
    
    // Generate avatar using Avataaars style (most reliable)
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodedSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9&backgroundType=gradientLinear`;
    
    console.log(`🎭 Generated avatar for ${firstName} ${lastName} (seed: ${seed}): ${avatarUrl}`);
    return avatarUrl;
  } catch (error) {
    console.error('Avatar generation error:', error);
    // Fallback
    const fallbackSeed = encodeURIComponent(seedOverride || `${firstName || 'user'}${lastName || 'avatar'}`);
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${fallbackSeed}`;
  }
} 

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'Techoon Student Registration',
    timestamp: new Date().toISOString()
  });
});

// Get student count
app.get('/api/students/count', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM students');
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('Error fetching count:', err);
    res.status(500).json({ error: 'Failed to fetch student count' });
  }
});

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get single student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create student
app.post('/api/students', async (req, res) => {
  try {
    const {
      first_name,
      middle_name = null,
      last_name,
      phone,
      alt_phone = null,
      email,
      company = null,
      photo = null
    } = req.body;

    console.log('📝 Received registration:', { first_name, last_name, email, phone });

    // Validate required fields
    if (!first_name || !last_name || !phone || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['first_name', 'last_name', 'phone', 'email']
      });
    }

    // Validate phone format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone must be 10 digits' });
    }

    if (alt_phone && !phoneRegex.test(alt_phone)) {
      return res.status(400).json({ error: 'Alternate phone must be 10 digits' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // If a photo was uploaded, use its content to generate a deterministic seed for DiceBear.
    let photoData;
    if (photo && photo.trim() !== '' && photo !== 'null') {
      // Hash the photo content (base64/data URL) to create a stable seed
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(photo).digest('hex');
      const seed = `${first_name || 'user'}${last_name || ''}${hash}`;
      photoData = generateHumanAvatar(first_name, last_name, seed);
      console.log('🎭 Generated DiceBear avatar from uploaded photo seed:', photoData);
    } else {
      photoData = generateHumanAvatar(first_name, last_name);
      console.log('🎭 Generated DiceBear avatar (name-based):', photoData);
    }

    // Insert into database
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO students 
       (first_name, middle_name, last_name, phone, alt_phone, email, company, photo, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [first_name, middle_name, last_name, phone, alt_phone, email, company, photoData]
    );

    // Fetch and return the created student
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId]);
    
    console.log('✅ Student registered successfully:', result.insertId);
    
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: rows[0]
    });
    
  } catch (err) {
    console.error('❌ Error creating student:', err);
    
    // Handle duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email or phone number already exists' });
    }
    
    res.status(500).json({ 
      error: 'Failed to register student',
      details: err.message
    });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    
    // Add photo if provided
    if (updates.photo !== undefined) {
      fields.push('photo = ?');
      values.push(updates.photo);
    }
    
    // Add other fields
    const allowedFields = ['first_name', 'middle_name', 'last_name', 'phone', 'alt_phone', 'email', 'company'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const pool = await getPool();
    const [result] = await pool.query(
      `UPDATE students SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Generate avatar endpoint (for testing)
app.get('/api/avatar/generate', async (req, res) => {
  try {
    const { firstName = 'User', lastName = 'Avatar' } = req.query;
    const avatarUrl = generateHumanAvatar(firstName, lastName);
    
    res.json({
      avatar: avatarUrl,
      seed: `${firstName}${lastName}`,
      generated_at: new Date().toISOString(),
      test_url: avatarUrl
    });
  } catch (err) {
    console.error('Error generating avatar:', err);
    res.status(500).json({ error: 'Failed to generate avatar' });
  }
});

// Test DiceBear URL endpoint
app.get('/api/test-dicebear', async (req, res) => {
  const testUrls = {
    avataaars_png: 'https://api.dicebear.com/7.x/avataaars/png?seed=test',
    avataaars_svg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    human_png: 'https://api.dicebear.com/7.x/human/png?seed=test',
    human_svg: 'https://api.dicebear.com/7.x/human/svg?seed=test'
  };
  
  res.json(testUrls);
});

// Serve frontend for any route not matched by API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'form.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
  console.log(`📁 API Endpoints:`);
  console.log(`   Health:        http://localhost:${PORT}/api/health`);
  console.log(`   Students:      http://localhost:${PORT}/api/students`);
  console.log(`   Count:         http://localhost:${PORT}/api/students/count`);
  console.log(`   Avatar Gen:    http://localhost:${PORT}/api/avatar/generate?firstName=John&lastName=Doe`);
  console.log(`   Test URLs:     http://localhost:${PORT}/api/test-dicebear`);
  console.log(`\n📝 Frontend: http://localhost:${PORT}`);
});