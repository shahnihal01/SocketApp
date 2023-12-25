# SocketApp
This is a Monorepo for a socket.io app which allows real-time updates of list of data.

## Getting Started
Instructions for setting up and running the project on a local machine.

### Prerequisites

Tools that need to be installed before running the project:
- Node.js
- npm or yarn
- MongoDB

### Installation
```bash
# Clone the repository
git clone https://github.com/shahnihal01/SocketApp.git

# Navigate to the project directory
cd SocketApp

# Install dependencies
npm install
```

## Before running the project add .env files in packages/backend and packages/frontend:
/packages/backend/.env
```MONGO_URL=<your-mongo-uri>```

/packages/frontend/.env
```NEXT_PUBLIC_API_URL=http://localhost:5000```

## Run frontend development server
cd packages/frontend
npm run dev

## Run backend development server
cd packages/backend
npm start
