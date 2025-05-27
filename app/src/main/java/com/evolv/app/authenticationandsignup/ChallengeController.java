package com.evolv.app.authenticationandsignup;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin(origins = "http://localhost:3000")
public class ChallengeController {

    @Autowired
    private ChallengeRepository challengeRepository;
    
    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping
    public List<Challenge> getAllChallenges() {
        return challengeRepository.findAll();
    }

    @PostMapping("/add")
    public Challenge addChallenge(@RequestBody Challenge challenge) {
        challenge.setCreatedAt(LocalDateTime.now());
        challenge.setApplause(0);
        return challengeRepository.save(challenge);
    }

    @PutMapping("/applause")
    public ResponseEntity<String> updateApplause(@RequestBody ApplauseRequest request) {
        Query query = new Query(Criteria
                .where("username").is(request.getUsername())
                .and("challenge").is(request.getChallenge()));
                
        Update update = new Update().inc("applause", 1);
        
        Challenge updatedChallenge = mongoTemplate.findAndModify(
            query,
            update,
            Challenge.class
        );
        
        if (updatedChallenge != null) {
            return ResponseEntity.ok("Applause updated");
        }
        return ResponseEntity.status(404).body("Challenge not found");
    }
}

class ApplauseRequest {
    private String username;
    private String challenge;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getChallenge() { return challenge; }
    public void setChallenge(String challenge) { this.challenge = challenge; }
}