# Multi-stage build for smaller image
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/uploads/products /app/uploads/profiles /app/config

# Copy built JAR from builder stage
COPY --from=builder /app/target/JwtDemo-0.0.1-SNAPSHOT.jar app.jar

# Copy GCS service account key (optional)
COPY service-account-key.json* /app/config/

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Environment variables
ENV ENVIRONMENT=production
ENV PORT=8081
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/config/service-account-key.json
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Expose port
EXPOSE 8081

# Run application
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]