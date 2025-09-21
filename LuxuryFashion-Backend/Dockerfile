# Stage 1: Build the JAR
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/JwtDemo-0.0.1-SNAPSHOT.jar app.jar

# Cloud Run expects the app to listen on the PORT env variable
ENV PORT=8080
EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
