FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw clean package -DskipTests

# Create uploads directory
RUN mkdir -p /app/uploads/products /app/uploads/profiles

# Create directory for GCS service account key
RUN mkdir -p /app/config

# Copy GCS service account key (if exists)
COPY service-account-key.json* /app/config/

# Expose port
EXPOSE 8080

# Set environment variables
ENV ENVIRONMENT=production
ENV PORT=8080
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/config/service-account-key.json

# Run application
CMD ["java", "-jar", "target/JwtDemo-0.0.1-SNAPSHOT.jar"]