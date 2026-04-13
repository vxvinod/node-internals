const express = require('express');
const app = express();
const PORT = 3000;
const fs = require('fs').promises
const DATA_FILE = './todo.json'


app.use(express.json());

let todos = []
let id = 1

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
    res.json(todos)
})

// post
app.post('/todos', async (req, res) => {
    const todo = {
        id: id ++,
        task: req.body.task,
        done: false
    }
    todos.push(todo);
    await saveTodos(todo);
    res.status(201).json(todo)
})

//put
app.put('/todo/:id', async (req, res) => {
    let todo = todos.find(t => t.id === parseInt(req.params.id))
    if(!todo) return res.status(404).json({message: "todo not found"})
    
    todo.task = req.body.task !== undefined ? req.body.task : todo.task;
    todo.done = req.body.done !== undefined ? req.body.done : todo.done;
    await saveTodos(todo);
    res.json(todo);
})

//delete
app.delete('/todo/:id', async (req, res) => {
    todos = todos.filter(t => t.id !== parseInt(req.params.id));
    await saveTodos(todos);
    res.json({message: "deleted"});
})

async function startServer() {
    todos = await loadTodos();
    id = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;

    app.listen(PORT, () => {
        console.log('server started..goahead ${PORT}');
    })
}

startServer();



