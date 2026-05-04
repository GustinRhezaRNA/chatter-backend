Chatter Backend

This repository contains the backend system for the Chatter application — a real-time chat platform built with a modern, scalable architecture using GraphQL.

The backend is designed to handle real-time communication, secure authentication, and efficient data management.

🚀 Tech Stack
- Framework: NestJS
  Serves as the core foundation of the application, providing a clean, modular structure with enterprise-grade dependency injection.
- API Layer: GraphQL & Apollo Server
  Uses GraphQL instead of traditional REST APIs, allowing clients to request only the data they need with high flexibility.
- Database: MongoDB & Mongoose
  A NoSQL database solution used to manage structured data such as users, profiles, chat rooms, and messages.
- Cloud Storage: AWS S3
  Integrated via @aws-sdk/client-s3 for storing and serving user-uploaded media such as profile avatars and attachments.
- Real-time Engine: Redis (Pub/Sub)
  Powered by ioredis and graphql-redis-subscriptions to enable scalable real-time messaging across multiple server instances.
- Logging: Pino
  High-performance asynchronous logging (nestjs-pino, pino-http) for structured and efficient system monitoring.
  
✨ Backend Features
1. JWT Authentication & Authorization
Built with Passport.js and @nestjs/jwt
Tokens are stored as HttpOnly cookies for better security
Passwords are securely hashed using bcrypt

2. Real-time Messaging System
Fully bidirectional communication
Implemented using WebSockets via graphql-ws and graphql-subscriptions
Enables instant message delivery without polling

3. Media Upload (Avatar Support)
Users can upload profile images
Files are securely stored and served via AWS S3

4. Strong Validation Layer
Request validation using:
class-validator
class-transformer
joi (for environment variables)
Ensures data consistency and prevents invalid input
5. CORS Support
Configurable Cross-Origin Resource Sharing (CORS)
Allows secure communication between frontend, local development, and production environments
