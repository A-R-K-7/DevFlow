# 🚀 DevFlow

**CI/CD Deployment Tracking and Release Management Platform**

[![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 📖 Overview

DevFlow is an enterprise-grade backend platform designed to help software teams **manage projects**, **track deployments**, **monitor release statuses**, **manage environments**, and **collaborate effectively**. Built with production-level architecture patterns used in real-world DevOps tools like GitLab CI/CD, Jenkins, and AutoRABIT.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│       (React SPA / Swagger UI / REST Clients / WebSocket)       │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     SECURITY LAYER                              │
│        JWT Authentication Filter → Security Config              │
│          Token Provider → Entry Point → RBAC                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    CONTROLLER LAYER                             │
│  AuthController │ ProjectController │ DeploymentController      │
│  TeamMemberController │ DashboardController                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     SERVICE LAYER                               │
│   AuthService │ ProjectService │ DeploymentService              │
│   TeamMemberService │ DashboardService │ AuditLogService        │
│   DeploymentSimulationService (Async)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    REPOSITORY LAYER                             │
│  UserRepo │ ProjectRepo │ DeploymentRepo │ TeamMemberRepo       │
│  AuditLogRepo                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     DATABASE LAYER                              │
│                   MySQL 8.0 / H2 (dev)                          │
│            JPA + Hibernate ORM │ Indexing                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Core Modules
- **🔐 Authentication & Authorization** — JWT-based stateless auth with BCrypt password hashing and role-based access control (ADMIN, DEVELOPER, RELEASE_MANAGER)
- **📁 Project Management** — Full CRUD with search, pagination, sorting, and ownership-based authorization
- **🚀 Deployment Tracking** — Deployment lifecycle management (PENDING → RUNNING → SUCCESS/FAILED) with environment tracking (DEV, QA, STAGING, PRODUCTION)
- **👥 Team Collaboration** — User-to-project assignment with role context and duplicate prevention
- **📊 Dashboard Analytics** — Aggregate statistics, success/failure rates, environment breakdowns, and activity feeds

### Advanced Features
- **⚡ WebSocket Live Updates** — Real-time deployment status broadcasting via STOMP/SockJS
- **🔄 Async Deployment Simulation** — Background deployment lifecycle simulation with configurable success rates
- **📝 Audit Logging** — Complete action trail with REQUIRES_NEW transaction propagation
- **📄 Pagination & Sorting** — Enterprise-grade paginated responses across all list endpoints
- **🔍 Search & Filtering** — Keyword search for projects, multi-parameter filtering for deployments
- **🐳 Docker Support** — Multi-stage Dockerfile and Docker Compose for containerized deployment
- **📚 Swagger/OpenAPI Documentation** — Interactive API docs with JWT auth support

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | Frontend library |
| Vite | Frontend build tool |
| Tailwind CSS | UI styling and responsive design |
| Framer Motion | Smooth UI animations and transitions |
| Recharts | Data visualization for dashboard |
| React Router v7 | Client-side routing |
| Axios & SockJS/STOMP | API and real-time WebSocket communication |

### Backend
| Technology | Purpose |
|---|---|
| Java 17 | Core language |
| Spring Boot 3.2 | Application framework |
| Spring Security 6 | Authentication & authorization |
| Spring Data JPA | Database abstraction |
| Hibernate | ORM |
| MySQL 8.0 | Production database |
| H2 | Development/test database |
| JWT (jjwt 0.12.x) | Token-based authentication |
| WebSocket (STOMP) | Real-time communication |
| SpringDoc OpenAPI | API documentation |
| Lombok | Boilerplate reduction |
| Maven | Build tool |
| Docker | Containerization |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and get JWT | Public |

### Projects
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/projects` | Create project | ADMIN, DEVELOPER |
| GET | `/api/projects` | List all projects (paginated) | Authenticated |
| GET | `/api/projects/{id}` | Get project by ID | Authenticated |
| PUT | `/api/projects/{id}` | Update project | Creator, ADMIN |
| DELETE | `/api/projects/{id}` | Delete project | ADMIN |
| GET | `/api/projects/search?keyword=` | Search projects | Authenticated |

### Deployments
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/deployments` | Trigger deployment | Authenticated |
| PUT | `/api/deployments/{id}/status` | Update status | ADMIN, RELEASE_MANAGER |
| GET | `/api/deployments` | List deployments (filtered) | Authenticated |
| GET | `/api/deployments/project/{id}` | Deployments by project | Authenticated |
| GET | `/api/deployments/recent` | Recent deployments | Authenticated |

### Team Management
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/teams/assign` | Assign member | ADMIN, RELEASE_MANAGER |
| DELETE | `/api/teams/{id}` | Remove member | ADMIN |
| GET | `/api/teams/project/{id}` | Project members | Authenticated |
| GET | `/api/teams/user/{id}` | User assignments | Authenticated |

### Dashboard
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Platform statistics | Authenticated |
| GET | `/api/dashboard/activity` | Recent activity | Authenticated |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.0 (or use H2 dev profile)

### Quick Start (H2 - No MySQL Required)

#### 1. Start the Backend
```bash
# Clone the repository
git clone https://github.com/yourusername/devflow.git
cd devflow

# Run with H2 in-memory database
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### 2. Start the Frontend
```bash
# Open a new terminal
cd devflow/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### With MySQL

```bash
# 1. Create the database (MySQL will auto-create with config, but ensure server is running)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS devflow_db;"

# 2. Update credentials in application.properties if needed

# 3. Run the application
./mvnw spring-boot:run
```

### With Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Access Points
- **Frontend Dashboard**: http://localhost:5173
- **API Base URL**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **H2 Console (dev)**: http://localhost:8080/h2-console
- **WebSocket**: ws://localhost:8080/ws

---

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@devflow.io",
    "password": "password123",
    "role": "ADMIN"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@devflow.io",
    "password": "password123"
  }'
```

### 3. Create a Project (use token from login)
```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectName": "Payment Service",
    "description": "Microservice for payment processing",
    "repositoryUrl": "https://github.com/org/payment-service"
  }'
```

### 4. Trigger a Deployment
```bash
curl -X POST http://localhost:8080/api/deployments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "deploymentName": "Release v2.1.0",
    "deploymentVersion": "2.1.0",
    "environment": "STAGING",
    "projectId": 1
  }'
```

---

## 📂 Project Structure

```
src/main/java/com/devflow/
├── DevFlowApplication.java          # Application entry point
├── config/                          # Configuration classes
│   ├── AsyncConfig.java
│   ├── AuditConfig.java
│   ├── OpenApiConfig.java
│   └── WebSocketConfig.java
├── controller/                      # REST controllers
│   ├── AuthController.java
│   ├── DashboardController.java
│   ├── DeploymentController.java
│   ├── ProjectController.java
│   └── TeamMemberController.java
├── dto/                             # Data Transfer Objects
│   ├── request/
│   └── response/
├── entity/                          # JPA entities
│   ├── enums/
│   ├── AuditLog.java
│   ├── Deployment.java
│   ├── Project.java
│   ├── TeamMember.java
│   └── User.java
├── exception/                       # Exception handling
│   ├── GlobalExceptionHandler.java
│   └── ... (custom exceptions)
├── repository/                      # Spring Data repositories
├── security/                        # JWT & Spring Security
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationEntryPoint.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   └── SecurityConfig.java
├── service/                         # Business logic
│   ├── AuthService.java
│   ├── AuditLogService.java
│   ├── DashboardService.java
│   ├── DeploymentService.java
│   ├── DeploymentSimulationService.java
│   ├── ProjectService.java
│   └── TeamMemberService.java
└── websocket/                       # WebSocket support
    ├── DeploymentStatusMessage.java
    └── DeploymentWebSocketHandler.java
```

---

## 📸 Screenshots

> *Screenshots of Swagger UI and API responses will be added here.*

---

## 🔮 Future Improvements

- [ ] Refresh token mechanism
- [ ] Email notifications for deployment events
- [ ] Deployment rollback functionality
- [ ] CI/CD pipeline integration (GitHub Actions, Jenkins webhooks)
- [ ] Rate limiting and API throttling
- [ ] Caching layer (Redis)
- [ ] Deployment approval workflow
- [ ] Environment-specific configuration management
- [ ] Metrics and monitoring (Prometheus + Grafana)
- [ ] Multi-tenant support
- [x] Frontend dashboard (React/Vite/Tailwind)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

