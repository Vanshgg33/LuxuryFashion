package com.spring.config;

import com.spring.main.JwtDemoApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = JwtDemoApplication.class)
class DatabaseConfigTest {

    @Autowired
    private Environment environment;

    @Autowired
    private DataSource dataSource;

    @Test
    void testDatabaseConfiguration() {
        System.out.println("=== DATABASE CONFIGURATION TEST ===");
        
        String url = environment.getProperty("spring.datasource.url");
        String username = environment.getProperty("spring.datasource.username");
        String driverClassName = environment.getProperty("spring.datasource.driver-class-name");
        
        System.out.println("Database URL: " + url);
        System.out.println("Database Username: " + username);
        System.out.println("Database Driver: " + driverClassName);
        
        assertNotNull(url, "Database URL should not be null");
        assertNotNull(username, "Database username should not be null");
        assertTrue(url.contains("mysql"), "Should be using MySQL database");
    }

    @Test
    void testDatabaseConnection() {
        System.out.println("=== DATABASE CONNECTION TEST ===");
        
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            System.out.println("Database Product: " + metaData.getDatabaseProductName());
            System.out.println("Database Version: " + metaData.getDatabaseProductVersion());
            System.out.println("Connection URL: " + metaData.getURL());
            
            assertTrue(metaData.getDatabaseProductName().toLowerCase().contains("mysql"), 
                      "Should be connected to MySQL database");
            
        } catch (Exception e) {
            fail("Failed to connect to database: " + e.getMessage());
        }
    }
}