const Project = require("../models/Projects.js");
const multer = require("multer");
const fs = require('fs');

const path = require("path");

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif|svg/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
});

// Create Project
const createProject = [
  upload.single('image'),
  async (req, res) => {
    const { title, linkDemo, linkGithub, tool } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const project = new Project({
      title,
      image: imagePath,
      linkDemo,
      linkGithub,
      tool: tool.split(','), // Mengubah string tools menjadi array
    });

    try {
      const savedProject = await project.save();
      res.status(201).json(savedProject);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
];

// Get All Projects
const getAllProjects = async (req, res) => {
    const { query } = req.query;
  try {
    let filter = {};
    if (query) {
        filter = {
          $or: [
            { title: { $regex: query, $options: 'i' } }, // Pencarian berdasarkan judul proyek
            { tool: { $regex: query, $options: 'i' } }  // Pencarian berdasarkan tools
          ]
        };
      }
    const projects = await Project.find(filter);

    if(projects.length === 0){
        return res.status(404).json({ message: 'No projects found' });
    }
    res.status(200).json(projects);
  } catch (error) {
    console.log("Error in getAllProjects controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get Project By ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(400).json({ error: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    console.log("Error in getProjectById controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Update Project
const updateProject = [
    upload.single('image'), // Opsional jika ingin mengganti gambar
    async (req, res) => {
      const { title, linkDemo, linkGithub, tool } = req.body;
      const projectId = req.params.id;
  
      try {
        // Temukan project yang akan diperbarui
        const project = await Project.findById(projectId);
  
        if (!project) {
          return res.status(404).json({ message: 'Project not found' });
        }
  
        const updateData = {
          title,
          linkDemo,
          linkGithub,
          tool: tool ? tool.split(',') : project.tool, // Mengubah string tools menjadi array jika diberikan
        };
  
        // Jika gambar baru diupload, hapus gambar lama
        if (req.file) {
          // Hapus gambar lama dari folder uploads
          if (project.image) {
            const oldImagePath = path.join(__dirname, '..', 'uploads', path.basename(project.image));
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
  
          // Set gambar baru
          updateData.image = `/uploads/${req.file.filename}`;
        }
  
        // Update project di database
        const updatedProject = await Project.findByIdAndUpdate(projectId, updateData, { new: true });
  
        res.status(200).json(updatedProject);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  ];

// Delete Project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if(project.image){
        const imagePath = path.join(__dirname, '..', 'uploads', path.basename(project.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search Projects
const searchProjects = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }
  try {
    const projects = await Project.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },        // Mencari judul proyek yang mengandung query
        { tool: { $regex: query, $options: 'i' } }          // Mencari tool yang mengandung query
      ]
    });

    if (projects.length === 0) {
        return res.status(404).json({ message: 'No projects found' });
      }

    res.status(200).json(projects);
  } catch (error) {
    console.log("Error in searchProjects controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
};
