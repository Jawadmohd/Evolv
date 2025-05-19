package com.evolv.app.authenticationandsignup;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000") 
@RestController
@RequestMapping("/api/tasks")
public class TodoController {

    @Autowired
    private ToDoRepository todoRepository;

    @GetMapping
    public ResponseEntity<?> getTodos(@RequestParam String username) {
        try {
            List<Todo> tasks = todoRepository.findByUsername(username);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching tasks");
        }
    }

  @PostMapping
public ResponseEntity<?> addTodo(@RequestBody Todo todoRequest, @RequestParam String username) {
    try {
        // Add username to the todo object
        Todo todo = new Todo();
        todo.setTitle(todoRequest.getTitle());
        todo.setPeriod(todoRequest.getPeriod());
        todo.setUsername(username); // Explicitly set username

        if (todo.getTitle() == null || todo.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Task description cannot be empty");
        }
        System.out.println("Received task: " + todo.getTitle() + " | User: " + username);
        Todo savedTask = todoRepository.save(todo);
        return ResponseEntity.ok(savedTask);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().body("Error adding task");
    }
}

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(
            @PathVariable String id,
            @RequestParam String username
    ) {
        try {
            Optional<Todo> task = todoRepository.findByIdAndUsername(id, username);

            if (task.isEmpty()) {
                return ResponseEntity.status(404).body("Task not found");
            }

            if (!"onetime".equals(task.get().getPeriod())) {
                return ResponseEntity.badRequest().body("Cannot delete permanent tasks");
            }

            todoRepository.deleteById(id);
            return ResponseEntity.ok("Task deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting task");
        }
    }
}
