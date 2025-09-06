package com.spring.notification;


import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService implements NotificationService {

    private final JavaMailSender emailSender;
    private final String fromEmail;


    public EmailNotificationService(JavaMailSender emailSender, @Value("${spring.mail.username}") String fromEmail) {
        this.emailSender = emailSender;
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendNotification(String recipient, String[] recipientList, String subject, String content) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            if(recipientList == null)
            {helper.setTo(recipient);}
            else
            {
                helper.setTo(fromEmail);
                helper.setBcc(recipientList);
            }
            helper.setSubject(subject);
            helper.setText(content, true); // 'true' enables HTML content
            helper.setFrom(fromEmail);

            emailSender.send(message);
            System.out.println("HTML Email sent successfully to: " + recipient);
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
            throw new ValidationException("Something went wrong");
        }
    }
}