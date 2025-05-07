# Solaryyn Frontend App

This project combines multiple frontend components into a single Next.js application.

## Flow

The application follows this user flow:

1. Terms and Conditions
2. Create Account / Login
3. Onboarding (4 steps)
4. Profile

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

### Docker

```
make build - to build the FE
make up - start the FE on 3003 port
make app-sh - connect to the FE container
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Component Structure

This app integrates components from multiple source directories into a unified flow:

- terms-and-conditions
- create-account / login
- onboard
- onboarding-2
- onboarding-3
- onboarding-4
- profile

Each component maintains its original styling and functionality while being part of a connected user journey.
