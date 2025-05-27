package com.evolv.app.authenticationandsignup;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "challenge")
public class Challenge {

    @Id
    private String id;
    private String username;
    private String challenge;
    private String duration;
    private int applause;           // ← int type
    private LocalDateTime createdAt;

    // ——— Getters & Setters ———

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }

    public String getChallenge() {
        return challenge;
    }
    public void setChallenge(String challenge) {
        this.challenge = challenge;
    }

    public String getDuration() {
        return duration;
    }
    public void setDuration(String duration) {
        this.duration = duration;
    }

    public int getApplause() {
        return applause;
    }
    public void setApplause(int applause) {    // ← only integer setter!
        this.applause = applause;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
