const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let todos = []
let id = 1

//get
app.get('/todos/', (req, res) => {
    res.json(todos)
})

// post
app.post('/todos', (req, res) => {
    const todo = {
        id: id ++,
        task: req.body.task,
        done: false
    }
    todos.push(todo);
    res.status(201).json(todo)
})

//put
app.put('/todo/:id', (req, res) => {
    let todo = todos.find(t => t.id === parseInt(req.params.id))
    if(!todo) return res.status(404).json({message: "todo not found"})
    
    todo.task = req.body.task !== undefined ? req.body.task : todo.task;
    todo.done = req.body.done !== undefined ? req.body.done : todo.done;
    res.json(todo);
})

//delete
app.delete('/todo/:id', (req, res) => {
    todos = todos.filter(t => t.id !== parseInt(req.params.id));
    res.json({message: "deleted"});
})

app.listen(PORT, () => {
    console.log('listening to server in port http://localhost:${PORT}');
})