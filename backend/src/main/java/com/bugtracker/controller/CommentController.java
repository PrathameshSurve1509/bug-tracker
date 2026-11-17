
package com.bugtracker.controller;

import com.bugtracker.dto.CommentRequest;
import com.bugtracker.dto.CommentResponse;
import com.bugtracker.service.CommentService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // Add a comment to a ticket
    @PostMapping("/ticket/{ticketId}")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(
            @PathVariable Long ticketId,
            @RequestBody CommentRequest request,
            Authentication authentication) {

        return commentService.addComment(
                ticketId,
                request,
                authentication.getName()
        );
    }

    // Get all comments for a ticket
    @GetMapping("/ticket/{ticketId}")
    public List<CommentResponse> getComments(@PathVariable Long ticketId) {
        return commentService.getComments(ticketId);
    }
}
