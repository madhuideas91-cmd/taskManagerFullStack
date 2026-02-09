package com.example.taskmanager.notification_service.service;


import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendInviteEmail(String email, Long teamId) {

        // Later you can plug SMTP / SendGrid here
        System.out.println(
                "📧 Sending TEAM INVITE email to " + email +
                        " for teamId=" + teamId
        );
    }
}
