const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @route GET /api/tasks?project=projectId
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.query.project })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/tasks/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route POST /api/tasks
router.post('/', protect, async (req, res) => {
  const { title, description, status, priority, dueDate, project, assignedTo } = req.body;
  try {
    // sanitize potential empty-string values which would cause Mongoose cast errors
    const sanitized = {
      title,
      description,
      status,
      priority,
      project,
      createdBy: req.user._id,
    };

    // only set assignedTo if a non-empty value was provided, otherwise null
    if (assignedTo && assignedTo !== '') sanitized.assignedTo = assignedTo;

    // parse dueDate if provided, otherwise leave undefined so schema can apply default/null
    if (dueDate && dueDate !== '') sanitized.dueDate = new Date(dueDate);

    const task = await Task.create(sanitized);

    const populated = await task.populate('assignedTo', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    // sanitize update payload to avoid casting empty strings to ObjectId/Date
    const updateData = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(updateData, 'assignedTo') && (updateData.assignedTo === '' || updateData.assignedTo === null)) {
      updateData.assignedTo = null;
    }
    if (Object.prototype.hasOwnProperty.call(updateData, 'dueDate') && (updateData.dueDate === '' || updateData.dueDate === null)) {
      updateData.dueDate = null;
    } else if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;