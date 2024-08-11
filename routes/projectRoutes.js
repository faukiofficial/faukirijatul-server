const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
} = require('../controllers/projectsController');

// Route untuk mendapatkan semua project
router.get('/projects', getAllProjects);

// Route untuk mendapatkan project berdasarkan ID
router.get('/projects/:id', getProjectById);

// Route untuk membuat project baru
router.post('/projects', createProject);

// Route untuk mengupdate project berdasarkan ID
router.put('/projects/:id', updateProject);

// Route untuk menghapus project berdasarkan ID
router.delete('/projects/:id', deleteProject);

// Route untuk mencari project berdasarkan query (contoh: search by title)
router.get('/projects/search', searchProjects);

module.exports = router;
