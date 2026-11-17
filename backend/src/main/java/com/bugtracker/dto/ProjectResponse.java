
package com.bugtracker.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class ProjectResponse {

    private Long id;
    private String name;
    private String description;
    private String ownerName;
    private Set<String> members;
    private LocalDateTime createdAt;

    public ProjectResponse(
            Long id,
            String name,
            String description,
            String ownerName,
            Set<String> members,
            LocalDateTime createdAt) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.ownerName = ownerName;
        this.members = members;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public Set<String> getMembers() {
        return members;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
