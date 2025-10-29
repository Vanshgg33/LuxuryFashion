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

# Expose port
EXPOSE 8080

# Set environment variables
ENV ENVIRONMENT=production
ENV PORT=8080

# Run application
CMD ["java", "-jar", "target/JwtDemo-0.0.1-SNAPSHOT.jar"]