# Stage 1: Build the JAR inside a Maven container with Java 21
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app

# Copy Maven project files
COPY pom.xml .
COPY src ./src

# Build the application JAR, skipping tests for faster build
RUN mvn clean package -DskipTests

# Stage 2: Run the application with Java 21 JRE
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/JwtDemo-0.0.1-SNAPSHOT.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
