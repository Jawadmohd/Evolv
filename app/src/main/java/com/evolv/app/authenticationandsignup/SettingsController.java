package com.evolv.app.authenticationandsignup;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final UserRepository userRepository;
    private final VideoInterestRepository videoInterestRepository;
    private final ToDoRepository todoRepository;

    public SettingsController(
            UserRepository userRepository,
            VideoInterestRepository videoInterestRepository,
            ToDoRepository todoRepository
    ) {
        this.userRepository = userRepository;
        this.videoInterestRepository = videoInterestRepository;
        this.todoRepository = todoRepository;
    }

    // Get all interests for a user
    @GetMapping("/interests/{username}")
    public ResponseEntity<List<VideoInterest>> getInterests(@PathVariable String username) {
        return ResponseEntity.ok(videoInterestRepository.findByUsername(username));
    }

    // Add new interest
    @PostMapping("/interests")
    public ResponseEntity<VideoInterest> addInterest(@RequestBody VideoInterest newInterest) {
        VideoInterest saved = videoInterestRepository.save(newInterest);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Delete an interest
    @DeleteMapping("/interests/{id}")
    public ResponseEntity<Void> deleteInterest(@PathVariable String id) {
        videoInterestRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Update username across User, VideoInterest, and Todo collections
    @PutMapping("/username")
    public ResponseEntity<?> updateUsername(@RequestBody UsernameUpdateRequest req) {
        // Verify current credentials
        User user = userRepository.findByUsernameAndPassword(
                req.getCurrentUsername(),
                req.getCurrentPassword()
        );
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect credentials");
        }

        // New username availability
        if (userRepository.findByUsername(req.getNewUsername()) != null) {
            return ResponseEntity.badRequest().body("Username already taken");
        }

        String oldUsername = user.getUsername();
        String newUsername = req.getNewUsername();

        // 1) Update User
        user.setUsername(newUsername);
        userRepository.save(user);

        // 2) Update VideoInterest docs
        List<VideoInterest> interests = videoInterestRepository.findByUsername(oldUsername);
        interests.forEach(i -> i.setUsername(newUsername));
        videoInterestRepository.saveAll(interests);

        // 3) Update Todo docs
        List<Todo> todos = todoRepository.findByUsername(oldUsername);
        todos.forEach(t -> t.setUsername(newUsername));
        todoRepository.saveAll(todos);

        return ResponseEntity.ok("Username updated successfully");
    }

    // Update password for User only
    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody PasswordUpdateRequest req) {
        User user = userRepository.findByUsernameAndPassword(
                req.getUsername(),
                req.getCurrentPassword()
        );
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect current password");
        }
        user.setPassword(req.getNewPassword());
        userRepository.save(user);
        return ResponseEntity.ok("Password updated successfully");
    }
}
