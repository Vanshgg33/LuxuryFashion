package com.spring.notification;

import org.springframework.stereotype.Service;

@Service
public interface NotificationService {
    void sendNotification(String recipient,String[] recipientList, String subject, String content);
}
