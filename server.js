const express = require('express');
const cors = require('cors');

const app = express();
let tasks = require('./data');

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* =============================
   REST API ENDPOINTS
============================= */

// ✅ GET all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// ✅ GET tasks by subject
app.get('/tasks/subject/:subject', (req, res) => {
  const filtered = tasks.filter(
    (t) => t.subject.toLowerCase() === req.params.subject.toLowerCase()
  );
  res.status(200).json(filtered);
});

// ✅ GET completed tasks
app.get('/tasks/status/completed', (req, res) => {
  res.status(200).json(tasks.filter((t) => t.completed));
});

// ✅ GET pending tasks
app.get('/tasks/status/pending', (req, res) => {
  res.status(200).json(tasks.filter((t) => !t.completed));
});

// ✅ GET statistics (MUST COME BEFORE :id)
app.get('/tasks/stats', (req, res) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const progress = total === 0 ? 0 : ((completed / total) * 100).toFixed(2);

  res.status(200).json({
    total,
    completed,
    progress: progress + '%',
  });
});

// ✅ GET random task (MUST COME BEFORE :id)
app.get('/tasks/random', (req, res) => {
  if (tasks.length === 0) {
    return res.status(404).json({ message: 'No tasks available' });
  }

  const random = tasks[Math.floor(Math.random() * tasks.length)];
  res.status(200).json(random);
});

// ✅ GET task by ID (MOVE THIS AFTER ALL SPECIFIC ROUTES)
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id == req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.status(200).json(task);
});

// ✅ POST create task
app.post('/tasks', (req, res) => {
  const { subject, title, deadline } = req.body;

  if (!subject || !title || !deadline) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    subject,
    title,
    deadline,
    completed: false,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// ✅ PUT update task
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id == req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const { subject, title, deadline, completed } = req.body;

  if (subject !== undefined) task.subject = subject;
  if (title !== undefined) task.title = title;
  if (deadline !== undefined) task.deadline = deadline;
  if (completed !== undefined) task.completed = completed;

  res.status(200).json(task);
});

// ✅ DELETE task
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.status(200).json({ message: 'Task deleted successfully' });
});

// ✅ Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: "Study Plan API is Running"
  });
});

// ✅ 404 handler (MUST BE LAST)
app.use((req, res) => {
  res.status(404).send("Backend Running " + req.originalUrl);
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});