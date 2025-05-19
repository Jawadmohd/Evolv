package com.evolv.app.authenticationandsignup;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private VideoInterestRepository interestRepo;

    @Autowired
    private YouTubeService youTubeService;

    @GetMapping("/all")
public ResponseEntity<List<Map<String, String>>> getVideosByUsername(@RequestParam String username) {
    List<VideoInterest> interests = interestRepo.findByUsername(username);
    List<Map<String, String>> videos = new ArrayList<>();

    for (VideoInterest interest : interests) {
        videos.addAll(youTubeService.getVideosForInterest(interest.getInterest()));
    }

    return ResponseEntity.ok(videos);
}

}
