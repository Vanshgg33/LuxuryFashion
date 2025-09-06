package com.spring.notification;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationFactory {
    private final Map<String, NotificationService> notificationServices = new ConcurrentHashMap<>();

    @Autowired
    public NotificationFactory(EmailNotificationService emailNotificationService) {
        registerNotificationService("email", emailNotificationService);
    }

    public NotificationService getNotificationService(String type) {
        NotificationService service = notificationServices.get(type.toLowerCase());
        if (service == null) {
            throw new IllegalArgumentException("Unsupported notification type: " + type);
        }
        return service;
    }

    public void registerNotificationService(String type, NotificationService service) {
        notificationServices.put(type.toLowerCase(), service);
    }
}