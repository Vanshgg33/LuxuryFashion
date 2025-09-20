package com.spring.notification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationManager {
    private final NotificationFactory notificationFactory;

    @Autowired
    public NotificationManager(NotificationFactory notificationFactory) {
        this.notificationFactory = notificationFactory;
    }

    public void sendNotification(String type, String recipient,String[] recipientList, String subject, String content) throws Exception {
        NotificationService service = notificationFactory.getNotificationService(type);
        service.sendNotification(recipient,recipientList, subject, content);
    }
}