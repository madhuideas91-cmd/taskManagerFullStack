package com.example.taskmanager.notification_service.service;


import com.example.taskmanager.notification_service.model.NotificationPreference;
import com.example.taskmanager.notification_service.dto.NotificationPreferenceRequest;
import com.example.taskmanager.notification_service.repository.NotificationPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PreferenceService {

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    public List<NotificationPreference> getByUserId(Long userId) {
        return preferenceRepository.findByUserId(userId);
    }

    public void save(Long userId, List<NotificationPreferenceRequest> prefs) {
        List<NotificationPreference> entities = prefs.stream().map(p -> {
            NotificationPreference np = preferenceRepository
                    .findByUserIdAndType(userId, p.getType())
                    .orElse(new NotificationPreference());

            np.setUserId(userId);
            np.setType(p.getType());
            np.setEmailEnabled(p.isEmailEnabled());
            np.setInAppEnabled(p.isInAppEnabled());

            return np;
        }).collect(Collectors.toList());

        preferenceRepository.saveAll(entities);
    }
}
