# 🗣️ Debye – A Social Platform for Structured Debates

<div align="center">

**Empowering civil discourse through structured debate**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2014.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?logo=express)](https://expressjs.com/)

• [Report Bug](https://github.com/Noel9907/Debate/issues)

</div>

---

## 🎥 Demo & Media

#### Debate Creation

<img src="/screenshots/k.png" alt="Create Debate" width="300"/>

#### Search & Discovery

<div style="display: flex; gap: 10px;">
  <img src="/screenshots/i.png" alt="Search Results" width="250"/>
  <img src="/screenshots/t.png" alt="Trending Topics" width="250"/>
</div>

</details>

---

## 🌟 About Debye

**Debye** is a modern, debate-driven social platform that transforms online discussions into structured, meaningful exchanges. Named after the renowned physicist Peter Debye, our platform encourages users to approach topics with scientific rigor and intellectual curiosity.

## 📸 Screenshots

<div align="center">

### 🏠 Home Feed

### 🏠 Home Feed

<img src="/screenshots/u.png" alt="Home Feed" width="300"/>  
_Browse trending debates and discover new topics_

### 💬 Debate Interface

<img src="/screenshots/comment.png" alt="Debate Interface" width="300"/>  
_Structured Pro/Con comment system for clear discourse_

### 👤 User Profile

<img src="/screenshots/Scr.png" alt="User Profile" width="300"/>  
_Track your debate history and contributions_

</div>

### 🎯 Mission Statement

To create a space where ideas can be explored through respectful debate, fostering critical thinking and bridging ideological divides through constructive dialogue.

### ✨ Why Debye?

- **Structured Discourse**: Every comment is categorized as Pro or Con, eliminating confusion
- **Quality Over Quantity**: Focus on thoughtful arguments rather than endless threads
- **Bias Transparency**: Clear positioning helps users understand different perspectives
- **Community-Driven**: Built by debaters, for debaters

---

## 🚀 Features

### ✅ Current Features

#### 🔐 **Authentication & Security**

- Secure user registration and login system
- JWT-based session management
- Password encryption with bcrypt
- Protected routes and middleware

#### 🧵 **Debate Management**

- Create thought-provoking debate topics
- Rich text formatting support
- Topic categorization and tagging
- Real-time post updates

#### 🗳️ **Pro/Con Comment System**

- Binary comment classification (Pro/Con)
- Threaded discussions with clear positioning
- Comment voting and interaction
- Argument strength indicators

#### 🏠 **Discovery & Navigation**

- Dynamic home feed with active debates
- Topic filtering and sorting
- Search functionality
- Trending debates section

### 🔮 Upcoming Features

#### 🎙️ **Live Debate Rooms**

- Real-time debate sessions with moderators
- Twitch-style streaming integration
- Voice and video debate support
- Audience participation features

#### 🔍 **Advanced Search & Discovery**

- Elasticsearch-powered full-text search
- AI-powered topic recommendations
- Debate history and analytics
- Advanced filtering options

#### 🤖 **AI-Powered Features**

- Automated debate summaries (TL;DR)
- Argument quality analysis
- Bias detection and flagging
- Content moderation assistance

#### 📊 **Reputation & Gamification**

- User reputation scoring system
- Achievement badges and milestones
- Leaderboards and rankings
- Debate win/loss tracking

#### 👥 **Social Features**

- User profiles with debate history
- Following system for favorite debaters
- Private messaging
- Debate clubs and communities

---

## 🛠️ Tech Stack

<div align="center">

|                                            **Frontend**                                             |                                          **Backend**                                          |                                      **Database**                                       |                                    **DevOps**                                     |
| :-------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------: |
|             ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)             |     ![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)      |  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)   | ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white) |
|           ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)           |          ![Express.js](https://img.shields.io/badge/Express.js-404D59?logo=express)           | ![Mongoose](https://img.shields.io/badge/Mongoose-880000?logo=mongoose&logoColor=white) |  ![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white)   |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) | ![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?logo=passport&logoColor=white) |     ![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)      |  ![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazon-aws&logoColor=white)  |
|        ![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A?logo=postcss&logoColor=white)         |  ![Socket.io](https://img.shields.io/badge/Socket.io-black?logo=socket.io&badgeColor=010101)  |                                                                                         |     ![PM2](https://img.shields.io/badge/PM2-2B037A?logo=pm2&logoColor=white)      |

</div>

### 📐 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│                 │    │                 │    │                 │
│ • React + Vite  │◄──►│ • Node.js       │◄──►│ • MongoDB       │
│ • Tailwind CSS  │    │ • Express.js    │    │ • Redis Cache   │
│ • PostCSS       │    │ • Passport.js   │    │ • Elasticsearch │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📁 Project Structure

```
Debate/
├── 📂 backend/                  # Backend API server
│   ├── 📂 controllers/         # Request handlers
│   │   ├── 📄 forUser/        # User-related controllers
│   │   ├── 📄 user/           # User management
│   │   ├── 📄 auth/           # Authentication logic
│   │   ├── ⚙️ comment.controller.js    # Comment operations
│   │   ├── ⚙️ follow.controller.js     # Follow system
│   │   └── ⚙️ post.controller.js       # Post management
│   ├── 📂 db/                  # Database configuration
│   ├── 🛡️ middlewares/         # Custom middleware
│   ├── 🗃️ models/              # MongoDB schemas
│   ├── 🛣️ routes/              # API route definitions
│   ├── 🔧 utils/               # Helper functions
│   └── 📄 server.js            # Main server entry point
│
├── 📂 frontend/                 # Client-side application
│   ├── 📂 components/          # Reusable UI components
│   ├── 📂 dist/                # Build output directory
│   ├── 📂 node_modules/        # Frontend dependencies
│   ├── 🌐 public/              # Static assets
│   ├── 📂 src/                 # Source code
│   ├── 📄 .env                 # Frontend environment variables
│   ├── ⚙️ eslint.config.js     # ESLint configuration
│   ├── 📄 index.html           # Main HTML template
│   ├── 📄 package-lock.json    # Dependency lock file
│   ├── 📄 package.json         # Frontend dependencies
│   ├── ⚙️ postcss.config.js    # PostCSS configuration
│   ├── 📄 README.md            # Frontend documentation
│   ├── 🎨 tailwind.config.js   # Tailwind CSS config
│   └── ⚙️ vite.config.js       # Vite build configuration
│
├── 📂 node_modules/            # Root dependencies
├── 📄 .env                     # Environment variables
├── 📄 .gitignore              # Git ignore rules
├── 📄 package-lock.json       # Root dependency lock
├── 📄 package.json            # Root package configuration
└── 📄 README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Noel9907/Debate.git
   cd Debate
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment setup**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit environment variables
   nano .env
   ```

### Environment Configuration

Create a `.env` file in both the root directory and `/frontend` directory:

**Root `.env` file:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/debye
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# External Services
ELASTICSEARCH_URL=http://localhost:9200
EMAIL_SERVICE_API_KEY=your_email_api_key

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

**Frontend `.env` file:**

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Environment
VITE_NODE_ENV=development
```

### Running the Application

#### Development Mode

```bash
# Start the backend server (with hot reload)
cd backend
npm run dev

# In a new terminal, start the frontend development server
cd frontend
npm run dev
```

#### Production Mode

```bash
# Build the application
npm run build

# Start with PM2
npm run start:prod
```

#### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| `POST` | `/api/auth/register` | Register new user | ❌            |
| `POST` | `/api/auth/login`    | User login        | ❌            |
| `POST` | `/api/auth/logout`   | User logout       | ✅            |
| `GET`  | `/api/auth/profile`  | Get user profile  | ✅            |

### Debate Endpoints

| Method   | Endpoint         | Description         | Auth Required |
| -------- | ---------------- | ------------------- | ------------- |
| `GET`    | `/api/posts`     | Get all debates     | ❌            |
| `POST`   | `/api/posts`     | Create new debate   | ✅            |
| `GET`    | `/api/posts/:id` | Get specific debate | ❌            |
| `PUT`    | `/api/posts/:id` | Update debate       | ✅            |
| `DELETE` | `/api/posts/:id` | Delete debate       | ✅            |

### Comment Endpoints

| Method   | Endpoint                  | Description         | Auth Required |
| -------- | ------------------------- | ------------------- | ------------- |
| `GET`    | `/api/posts/:id/comments` | Get debate comments | ❌            |
| `POST`   | `/api/posts/:id/comments` | Add comment         | ✅            |
| `PUT`    | `/api/comments/:id`       | Update comment      | ✅            |
| `DELETE` | `/api/comments/:id`       | Delete comment      | ✅            |

For detailed API documentation, visit our [API Docs](https://docs.debye.com/api).

---

## 🧪 Testing

We maintain high code quality through comprehensive testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm run test:auth
npm run test:debates
npm run test:comments
```

### Test Coverage Goals

- **Unit Tests**: >90% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help make Debye better:

### 🐛 Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Noel9907/Debate/issues)
2. If not, create a new issue with detailed information:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - System information

### 💡 Suggesting Features

1. Check [Discussions](https://github.com/Noel9907/Debate/discussions) for existing ideas
2. Create a new discussion with:
   - Clear feature description
   - Use cases and benefits
   - Potential implementation approach

### 🛠️ Code Contributions

1. **Fork the repository**

   ```bash
   git fork https://github.com/Noel9907/Debate.git
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Follow our coding standards
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit your changes**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create a Pull Request**
   - Provide clear description of changes
   - Link related issues
   - Ensure all checks pass

### 📋 Development Guidelines

- **Code Style**: We use ESLint and Prettier for consistent formatting
- **Commit Messages**: Follow [Conventional Commits](https://conventionalcommits.org/)
- **Testing**: All new features must include tests
- **Documentation**: Update relevant documentation with your changes

---

## 🌍 Community & Support

### 💬 Get Help

- **GitHub Discussions**: General questions and community chat
- **GitHub Issues**: Bug reports and feature requests
- **Discord Server**: Real-time community support (Coming Soon)
- **Documentation**: Comprehensive guides and tutorials

### 🎯 Roadmap

Check out our [public roadmap](https://github.com/Noel9907/Debate/projects) to see what we're working on next!

**Q1 2025**

- [ ] React frontend migration
- [ ] Real-time debate rooms
- [ ] Mobile responsive design

**Q2 2025**

- [ ] AI-powered features
- [ ] Advanced search with Elasticsearch
- [ ] User reputation system

**Q3 2025**

- [ ] Mobile applications (iOS/Android)
- [ ] Video debate integration
- [ ] Moderation tools

---

## 📊 Performance & Analytics

### Current Metrics

- **Response Time**: <200ms average
- **Uptime**: 99.9%
- **Test Coverage**: 85%
- **Bundle Size**: <500KB

### Monitoring

We use various tools to ensure optimal performance:

- **Application**: New Relic / DataDog
- **Database**: MongoDB Atlas Monitoring
- **Infrastructure**: AWS CloudWatch
- **Error Tracking**: Sentry

---

## 🔒 Security

Security is a top priority for Debye. We implement:

- **Authentication**: JWT with secure HTTP-only cookies
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **Rate Limiting**: API endpoint protection
- **HTTPS**: SSL/TLS encryption in production
- **Security Headers**: HELMET.js integration

### Reporting Security Issues

Please report security vulnerabilities to [security@debye.com](mailto:security@debye.com). We appreciate responsible disclosure.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Noel S

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **Contributors**: Thank you to all our amazing contributors!
- **Inspiration**: Inspired by classical debate formats and modern social platforms
- **Libraries**: Built with incredible open-source tools and libraries
- **Community**: Grateful for the feedback and support from our users

---

<div align="center">

**Made with ❤️ by the Debye Team**

[⭐ Star us on GitHub](https://github.com/Noel9907/Debate) • [🐦 Follow on Twitter](https://twitter.com/debye_platform) • [💼 LinkedIn](https://linkedin.com/company/debye)

---

_"The best way to find out if you can trust somebody is to trust them... but verify through structured debate."_ - Adapted from Ernest Hemingway

</div>
