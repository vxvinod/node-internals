const express = require('express');
const app = express();
const PORT = 3000;
const fs = require('fs').promises
const DATA_FILE = './todo.json'
const EventEmitter = require('events');
const todoEvents = new EventEmitter();

app.use(express.json());

let todos = [];
let id = 1;
let stats = {created: 0, updated: 0, deleted: 0};

async function loadTodos() {
    try {
        const data = await fs.readFile(DATA_FILE, 'UTF-8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

async function saveTodos(todos) {
    fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
}

//get
app.get('/todos/', (req, res) => {
    res.json(todos);
})

// post
app.post('/todos', async (req, res) => {
    const todo = {
        id: id ++,
        task: req.body.task,
        done: false
    }
    todos.push(todo);
    await saveTodos(todos);
    todoEvents.emit('todo:created', todo);
    res.status(201).json(todo)
})

//put
app.put('/todo/:id', async (req, res) => {
    let todo = todos.find(t => t.id === parseInt(req.params.id))
    if(!todo) return res.status(404).json({message: "todo not found"})
    
    todo.task = req.body.task !== undefined ? req.body.task : todo.task;
    todo.done = req.body.done !== undefined ? req.body.done : todo.done;
    await saveTodos(todo);
    todoEvents.emit('todo:updated', todo);
    res.json(todo);
})

//delete
app.delete('/todo/:id', async (req, res) => {
    todos = todos.filter(t => t.id !== parseInt(req.params.id));
    await saveTodos(todos);
    todoEvents.emit('todo:deleted', req.params.id);
    res.json({message: "deleted"});
})

async function startServer() {
    todos = await loadTodos();
    id = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;

    app.listen(PORT, () => {
        console.log(`server started..goahead ${PORT}`);
    })
}

async function logEvent(message) {
    const timestamp = new Date().toISOString();
    const logline = `[${timestamp}] ${message}\n`;
    await fs.appendFile('./app.log', logline);
    console.log(logline.trim());
}

todoEvents.on('todo:created', (todo) => {
    stats.created++;
    logEvent(`Todo Created - ${todo.id} - ${todo.task}`);
});

todoEvents.on('todo:updated', (todo) => {
    stats.updated++;
    logEvent(`Todo Updated - ${todo.id} - ${todo.task} - ${todo.done}`);
});

todoEvents.on('todo:deleted', (todoId) => {
    stats.deleted++;
    logEvent(`Todo Deleted - ${todoId}`);
});

todoEvents.on('error', (err) => {
    logEvent(`Error message ${err.message}`);
});


app.get('/stats', (req, res) => {
    res.json(stats);
})

startServer();



