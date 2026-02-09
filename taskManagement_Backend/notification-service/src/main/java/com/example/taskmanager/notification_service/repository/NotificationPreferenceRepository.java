package com.example.taskmanager.notification_service.repository;


import com.example.taskmanager.notification_service.model.NotificationPreference;
import com.example.taskmanager.notification_service.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    // Get all preferences for a user
    List<NotificationPreference> findByUserId(Long userId);

    // Get a specific type for a user
    Optional<NotificationPreference> findByUserIdAndType(Long userId, NotificationType type);
}
