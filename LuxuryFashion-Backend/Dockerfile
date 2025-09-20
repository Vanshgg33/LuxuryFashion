# Runtime image with JRE
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the prebuilt JAR into the container
COPY target/JwtDemo-0.0.1-SNAPSHOT.jar app.jar

# Expose backend port
EXPOSE 8081

# Run the JAR
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
