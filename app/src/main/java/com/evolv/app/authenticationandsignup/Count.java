package com.evolv.app.authenticationandsignup;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "count")
public class Count {
    @Id
    private String id;
    private String username;
    private int count;

    public Count() {}

    public Count(String username, int count) {
        this.username = username;
        this.count = count;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }
    public void increment() { this.count++; }
}
