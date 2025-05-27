package com.evolv.app.authenticationandsignup;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ChallengeRepository extends MongoRepository<Challenge, String> {
    Optional<Challenge> findByUsernameAndChallenge(String username, String challenge);
}
