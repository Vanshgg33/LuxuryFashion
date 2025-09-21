# Stage 1: Build the JAR
FROM maven:3.9.4-openjdk-21 AS build
WORKDIR /app
COPY pom.xml .

RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests
# Stage 2: Run the application
FROM openjdk:21-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Cloud Run expects the app to listen on the PORT env variable

EXPOSE 8080

CMD ["java", "-jar", "JwtDemo-0.0.1-SNAPSHOT.jar"]
