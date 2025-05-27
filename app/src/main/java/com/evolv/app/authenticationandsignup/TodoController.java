package com.evolv.app.authenticationandsignup;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/tasks")
public class TodoController {

    @Autowired
    private ToDoRepository todoRepository;

    @Autowired
    private CountRepository countRepository;

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
    public ResponseEntity<?> addTodo(@RequestBody Todo todoRequest,
                                     @RequestParam String username) {
        try {
            if (todoRequest.getTitle() == null || todoRequest.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Task description cannot be empty");
            }

            Todo todo = new Todo();
            todo.setTitle(todoRequest.getTitle());
            todo.setPeriod(todoRequest.getPeriod());
            todo.setUsername(username);

            Todo saved = todoRepository.save(todo);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error adding task");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(@PathVariable String id,
                                        @RequestParam String username) {
        try {
            Optional<Todo> opt = todoRepository.findByIdAndUsername(id, username);
            if (opt.isEmpty()) {
                return ResponseEntity.status(404).body("Task not found");
            }
            Todo task = opt.get();
            if (!"onetime".equals(task.getPeriod())) {
                return ResponseEntity.badRequest().body("Cannot delete permanent tasks");
            }

            // 1) Remove the task
            todoRepository.deleteById(id);

            // 2) Update or create the Count document
            Count userCount = countRepository
                    .findByUsername(username)
                    .map(c -> {
                        c.increment();
                        return countRepository.save(c);
                    })
                    .orElseGet(() -> {
                        Count c = new Count(username, 1);
                        return countRepository.save(c);
                    });

            return ResponseEntity.ok(
                String.format("Task deleted. %s has now deleted %d tasks.",
                              username, userCount.getCount())
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error deleting task");
        }
    }

    // inside TodoController (or a new @RestController @RequestMapping("/api/count"))
@GetMapping("/count")
public ResponseEntity<?> getDeletionCount(@RequestParam String username) {
    try {
        // look up the Count document for this user
        Optional<Count> optCount = countRepository.findByUsername(username);
        int cnt = optCount.map(Count::getCount).orElse(0);

        // return a small JSON payload
        Map<String,Object> body = Map.of(
            "username", username,
            "count", cnt
        );
        return ResponseEntity.ok(body);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity
               .status(HttpStatus.INTERNAL_SERVER_ERROR)
               .body("Error fetching deletion count");
    }
}

}
