package com.spring.main;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.username=admin",
        "spring.datasource.password=Vansh123.",
        "spring.datasource.url=jdbc:mysql://luxuryfashiondb.cbue4ygyimj2.ap-south-1.rds.amazonaws.com:3306/LuxuryFashionDB",
        "spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver",
        "spring.jpa.hibernate.ddl-auto=update",
        "spring.jpa.show-sql=false",
        "jwt.secret=8f7d3b92e61a4c5f0d8e9c7b6a5f4e3d2c1b0a9876543210fedcba9876543210"
})
class JwtDemoApplicationTests {
    @Test
    void contextLoads() {
    }
}
