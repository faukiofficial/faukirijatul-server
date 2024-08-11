const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  image: { 
    type: String, 
    required: true 
  },
  linkDemo: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  linkGithub: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  tool: [{ 
    type: String, 
    required: true 
  }],
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
