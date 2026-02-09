package com.example.taskmanager.notification_service.service;


import com.example.taskmanager.notification_service.model.Notification;
import com.example.taskmanager.notification_service.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
//    private final EmailService emailService;
//    private final TeamAuditRepository auditRepo;


    // keep last 50 notifications in-memory
    private final List<Notification> notifications = new LinkedList<>();

    public Notification createNotification(Notification notification) {
        // save to DB first
        Notification saved = notificationRepository.save(notification);

        // add to in-memory list
        notifications.add(0, saved); // newest on top
        if (notifications.size() > 50) {
            notifications.remove(50); // remove oldest
        }

        return saved;
    }

    public List<Notification> getAllNotifications() {
        return Collections.unmodifiableList(notifications);
        // If you want DB version instead:
        // return notificationRepository.findAll();
    }

    public Notification markAsRead(Long id) {
        Notification notification = notifications.stream()
                .filter(n -> n.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        notification.setRead(true);
        notificationRepository.save(notification);
        return notification;
    }

    public void deleteNotification(Long id) {
        notifications.removeIf(n -> n.getId().equals(id));
        notificationRepository.deleteById(id);
    }


}
