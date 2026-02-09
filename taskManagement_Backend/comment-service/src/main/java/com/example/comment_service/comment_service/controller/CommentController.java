package com.example.comment_service.comment_service.controller;

import com.example.comment_service.comment_service.entity.Comment;
import com.example.comment_service.comment_service.security.JwtUtils;
import com.example.comment_service.comment_service.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private final JwtUtils jwtUtils;

    public CommentController(CommentService commentService, JwtUtils jwtUtils) {
        this.commentService = commentService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addComment(@RequestHeader("Authorization") String auth,
                                        @RequestBody Comment comment) {
        if (auth == null || !auth.startsWith("Bearer ")) return ResponseEntity.status(401).build();

        String token = auth.substring(7);
        if (!jwtUtils.validateToken(token)) return ResponseEntity.status(401).build();

        String email = jwtUtils.extractUsername(token);
        comment.setUserName(email);
        comment.setUserId(1L); // placeholder for now

        return ResponseEntity.ok(commentService.addComment(comment));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<?> getComments(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getCommentsByTask(taskId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@RequestHeader("Authorization") String auth,
                                           @PathVariable Long id) {
        if (auth == null || !auth.startsWith("Bearer ")) return ResponseEntity.status(401).build();
        String token = auth.substring(7);
        if (!jwtUtils.validateToken(token)) return ResponseEntity.status(401).build();

        Long userId = 1L; // placeholder for now
        commentService.deleteComment(id, userId);
        return ResponseEntity.ok("Deleted successfully");
    }
}
