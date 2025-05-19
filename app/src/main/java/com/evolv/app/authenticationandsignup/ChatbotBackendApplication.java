package com.evolv.app.authenticationandsignup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@SpringBootApplication
public class ChatbotBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChatbotBackendApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/chat")
class ChatController {
    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private static final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

    @Value("${router.api.key}")
    private String routerKey;

    @Value("${router.model.id}")
    private String routerModel;

    private final RestTemplate restTemplate;

    public ChatController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        if (userMessage == null || userMessage.isBlank()) {
            return ResponseEntity.badRequest()
                                 .body(new ChatResponse(null, "🚫 Message cannot be empty"));
        }

        try {
            String reply = generateWithRouter(userMessage);
            return ResponseEntity.ok(new ChatResponse(reply, null));

        } catch (RateLimitException rle) {
            log.warn("Rate limit hit: resets at {} (in {}s)",
                     rle.getResetIso(), rle.getRetryAfterSeconds());
            return ResponseEntity
                   .status(HttpStatus.TOO_MANY_REQUESTS)
                   .header(HttpHeaders.RETRY_AFTER,  String.valueOf(rle.getRetryAfterSeconds()))
                   .header("X-RateLimit-Reset",     rle.getResetIso())
                   .body(new ChatResponse(
                       null,
                       String.format("⏳ Rate limit exceeded. Model unlocks at %s (in %d seconds).",
                                     rle.getResetIso(),
                                     rle.getRetryAfterSeconds())
                   ));

        } catch (Exception ex) {
            log.error("❌ API Error: {}", ex.getMessage(), ex);
            // graceful fallback quote
            String fallback = "🌟 Keep going — you've got this!";
            return ResponseEntity.ok(new ChatResponse(fallback, ex.getMessage()));
        }
    }

    private String generateWithRouter(String prompt) {
        if (routerKey == null || routerKey.isBlank()) {
            throw new IllegalStateException("🔑 Router API key not configured");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(routerKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        List<Map<String, String>> messages = List.of(
            Map.of("role", "system", "content", "You are a helpful assistant. Respond with one-line quotes."),
            Map.of("role", "user",   "content", prompt)
        );

        Map<String, Object> requestBody = Map.of(
            "model",       routerModel,
            "messages",    messages,
            "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(OPENROUTER_API_URL, request, Map.class);
        } catch (HttpStatusCodeException httpEx) {
            // handle HTTP-level 429
            if (httpEx.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                return throwRateLimitFromHeaders(httpEx);
            }
            String bodyText = httpEx.getResponseBodyAsString();
            throw new IllegalStateException("API call failed: " +
                                            httpEx.getStatusCode() + " - " + bodyText);
        }

        Map<?, ?> body = response.getBody();
        log.info("✅ OpenRouter raw response: {}", body);

        if (body == null) {
            throw new IllegalStateException("⚠️ Empty response body from OpenRouter");
        }

        // check JSON error block
        if (body.containsKey("error")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> err = (Map<String, Object>) body.get("error");
            String msg = Objects.toString(err.get("message"), "Unknown error");
            // if code==429 or metadata.headers.X-RateLimit-Reset present → rate limit
            Object code = err.get("code");
            Object metadata = err.get("metadata");
            if (Objects.equals(code, 429) ||
                (metadata instanceof Map &&
                 ((Map<?,?>)metadata).get("headers") instanceof Map &&
                 ((Map<?,?>)((Map<?,?>)metadata).get("headers")).containsKey("X-RateLimit-Reset"))
            ) {
                throw buildRateLimitException(err);
            }
            throw new IllegalStateException("🚫 OpenRouter error: " + msg);
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new IllegalStateException("⚠️ No choices in OpenRouter response");
        }

        Map<String, Object> first = choices.get(0);
        @SuppressWarnings("unchecked")
        Map<String, String> message = (Map<String, String>) first.get("message");
        String content = message != null ? message.get("content") : null;
        if (content == null || content.isBlank()) {
            throw new IllegalStateException("⚠️ AI returned empty content");
        }
        return content.trim();
    }

    private String throwRateLimitFromHeaders(HttpStatusCodeException httpEx) {
        List<String> ra = httpEx.getResponseHeaders().getOrDefault(HttpHeaders.RETRY_AFTER, List.of());
        int seconds = ra.isEmpty() ? 60 : Integer.parseInt(ra.get(0));
        // assume reset = now + seconds
        Instant reset = Instant.now().plus(seconds, ChronoUnit.SECONDS);
        throw new RateLimitException(reset.toEpochMilli(), seconds);
    }

    private RateLimitException buildRateLimitException(Map<String,Object> err) {
        @SuppressWarnings("unchecked")
        Map<String,Object> md      = (Map<String,Object>) err.get("metadata");
        @SuppressWarnings("unchecked")
        Map<String,Object> headers = (Map<String,Object>) md.get("headers");
        long resetMs = Long.parseLong(headers.get("X-RateLimit-Reset").toString());
        long nowMs   = Instant.now().toEpochMilli();
        int  secs    = (int) Math.max(1, (resetMs - nowMs) / 1_000);
        return new RateLimitException(resetMs, secs);
    }

    /** Thrown when we detect a 429 / rate-limit condition */
    static class RateLimitException extends RuntimeException {
        private final long   resetEpochMs;
        private final int    retryAfterSeconds;
        private final String resetIso;

        RateLimitException(long resetEpochMs, int retryAfterSeconds) {
            super("Rate limit exceeded, reset at " + Instant.ofEpochMilli(resetEpochMs));
            this.resetEpochMs      = resetEpochMs;
            this.retryAfterSeconds = retryAfterSeconds;
            this.resetIso          = Instant.ofEpochMilli(resetEpochMs).toString();
        }

        public long   getResetEpochMs()      { return resetEpochMs; }
        public int    getRetryAfterSeconds() { return retryAfterSeconds; }
        public String getResetIso()          { return resetIso; }
    }
}

class ChatResponse {
    private String reply;
    private String error;

    public ChatResponse(String reply, String error) {
        this.reply = reply;
        this.error = error;
    }
    public String getReply() { return reply; }
    public String getError() { return error; }
    public void setReply(String reply) { this.reply = reply; }
    public void setError(String error) { this.error = error; }
}
