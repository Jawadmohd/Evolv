package com.evolv.app.authenticationandsignup;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private final WebClient ollama;
    private final ObjectMapper json;

    public ChatController(WebClient ollamaClient, ObjectMapper objectMapper) {
        this.ollama = ollamaClient;
        this.json = objectMapper;
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamChat(@RequestBody Map<String, String> payload) {
        String userPrompt = payload.getOrDefault("message", "").trim();
        if (userPrompt.isEmpty()) {
            return Flux.just(
                ServerSentEvent.builder("🚫 Please enter a question")
                               .event("error")
                               .build()
            );
        }

        // Improved system prompt: clear, grammatically correct, AND leaves room for the user's text.
        String systemInstructions = """
You are a concise, chill assistant.  
User input may have missing spaces.  
When you respond, separate every pair of words with exactly one real space character.  
Do NOT write the word 'space'—only use actual spaces.
""";



    String fullPrompt = String.format(
    "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n" +
    "%s<|eot_id|>\n" +
    "<|start_header_id|>user<|end_header_id|>\n" +
    "%s<|eot_id|>\n" +
    "<|start_header_id|>assistant<|end_header_id|>\n",
    systemInstructions, 
    userPrompt
    );

        return ollama.post()
            .uri("/api/generate")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of(
                "model", "llama3.2",
                "prompt", fullPrompt,
                "stream", true,
                "options", Map.of(
                    "temperature", 0.3,
                    "max_tokens", 150,
                    "repeat_penalty", 1.2,
                    "top_k", 50
                )
            ))
            .retrieve()
            .bodyToFlux(String.class)
            .flatMap(line -> {
                    try {
                        Map<String, Object> chunk = json.readValue(line, Map.class);
                        String raw = chunk.getOrDefault("response", "").toString();

                        // 1) drop any literal "space"
                        String noWordSpace = raw.replaceAll("(?i)\\bspace\\b", "");

                        // 2) collapse multiple spaces to one
                        String cleaned = noWordSpace.replaceAll(" +", " ").trim();
                        if (cleaned.isEmpty()) return Flux.empty();

                        return Flux.just(
                        ServerSentEvent.builder(cleaned)
                                        .event("message")
                                        .build()
                        );
                    } catch (Exception e) {
                        log.warn("Failed to parse chunk: {}", line, e);
                        return Flux.empty();
                    }
                    })

            .onErrorResume(ex -> {
                log.error("Stream error", ex);
                return Flux.just(
                    ServerSentEvent.builder("⚠️ Error: Service unavailable")
                                   .event("error")
                                   .build()
                );
            });
    }
}
