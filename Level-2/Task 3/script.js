// Load tasks from localStorage
let tasks = [];

function loadTasks() {
    const stored = localStorage.getItem('todoApp');
    if (stored) {
        tasks = JSON.parse(stored);
    } else {
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem('todoApp', JSON.stringify(tasks));
    updateStats(); // Update stats whenever tasks change
}

function updateStats() {
    const total = tasks.length;
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    
    const totalElem = document.getElementById('totalTasks');
    const pendingCountElem = document.getElementById('pendingCount');
    const completedCountElem = document.getElementById('completedCount');
    const pendingBadge = document.getElementById('pendingBadge');
    const completedBadge = document.getElementById('completedBadge');
    
    if (totalElem) totalElem.textContent = total;
    if (pendingCountElem) pendingCountElem.textContent = pending;
    if (completedCountElem) completedCountElem.textContent = completed;
    if (pendingBadge) pendingBadge.textContent = pending;
    if (completedBadge) completedBadge.textContent = completed;
}

function addTask(text) {
    if (!text.trim()) {
        showToast('Please enter a task!', 'warning');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        addedAt: new Date().toLocaleString(),
        completedAt: null
    };
    
    tasks.push(newTask);
    saveTasks();
    render();
    showToast('Task added successfully!', 'success');
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        render();
        showToast('Task deleted', 'info');
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newText = prompt('Edit your task:', task.text);
    if (newText && newText.trim()) {
        task.text = newText.trim();
        saveTasks();
        render();
        showToast('Task updated', 'success');
    }
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    task.completed = !task.completed;
    
    if (task.completed) {
        task.completedAt = new Date().toLocaleString();
        showToast('Task completed! 🎉', 'success');
    } else {
        task.completedAt = null;
        showToast('Task moved back to pending', 'info');
    }
    
    saveTasks();
    render();
}

function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto remove after 2 seconds
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

function render() {
    const pendingList = document.getElementById('pendingList');
    const completedList = document.getElementById('completedList');
    
    if (!pendingList || !completedList) return;
    
    const pendingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    
    // Render pending tasks
    pendingList.innerHTML = '';
    if (pendingTasks.length === 0) {
        pendingList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <p>No pending tasks<br>Time to relax or add new tasks!</p>
            </div>
        `;
    } else {
        pendingTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            
            li.innerHTML = `
                <div class="task-content">
                    <div class="task-text">${escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="meta-item">📅 ${task.addedAt}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-success" data-id="${task.id}">✓ Complete</button>
                    <button class="btn btn-warning" data-id="${task.id}">✎ Edit</button>
                    <button class="btn btn-danger" data-id="${task.id}">✗ Delete</button>
                </div>
            `;
            
            pendingList.appendChild(li);
        });
    }
    
    // Render completed tasks
    completedList.innerHTML = '';
    if (completedTasks.length === 0) {
        completedList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏆</div>
                <p>No completed tasks yet<br>Start completing your tasks!</p>
            </div>
        `;
    } else {
        completedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item completed-task';
            
            li.innerHTML = `
                <div class="task-content">
                    <div class="task-text">${escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="meta-item">📅 Added: ${task.addedAt}</span>
                        <span class="meta-item">✅ Completed: ${task.completedAt || 'N/A'}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-secondary" data-id="${task.id}">↺ Undo</button>
                    <button class="btn btn-warning" data-id="${task.id}">✎ Edit</button>
                    <button class="btn btn-danger" data-id="${task.id}">✗ Delete</button>
                </div>
            `;
            
            completedList.appendChild(li);
        });
    }
    
    // Attach event listeners to buttons
    document.querySelectorAll('.btn-success').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            toggleComplete(id);
        });
    });
    
    document.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            toggleComplete(id);
        });
    });
    
    document.querySelectorAll('.btn-warning').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            editTask(id);
        });
    });
    
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            deleteTask(id);
        });
    });
}

// Simple XSS protection
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    render();
    updateStats();
    
    const addBtn = document.getElementById('addBtn');
    const taskInput = document.getElementById('taskInput');
    
    addBtn.addEventListener('click', () => {
        addTask(taskInput.value);
        taskInput.value = '';
        taskInput.focus();
    });
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
            taskInput.value = '';
        }
    });
});