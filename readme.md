# Bus Seat Booking System

A simple bus seat booking application.

---

## How to Start the Project

### 1. Backend Server

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
PORT=8080
DATABASE_URL="mongodb+srv://test_user:1GGliF4T3C46C4lJ@interview-ai-cluster.nmj79of.mongodb.net/test"
CLIENT_ORIGIN="http://localhost:3000"
```

Seed the initial trip and seats:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```
Backend runs on `http://localhost:8080`.

---

### 2. Frontend Client

In a new terminal:
```bash
cd client
npm install
```

Create a `.env.local` file inside `client/`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Start the frontend application:
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`.

---

## API Endpoints

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/trips` | Get all available trips |
| GET | `/trips/:tripId` | Get trip details by ID |
| GET | `/trips/:tripId/seats` | Get all seats and their status (`available` / `booked`) |
| POST | `/bookings` | Create a new booking |
| GET | `/bookings?phone={phone}` | Get bookings by phone number |
| DELETE | `/bookings/:id` | Cancel booking and release seats |

### Sample Booking Request Body:
```json
{
  "tripId": "6ace303f1cf0778a2c23eae2",
  "seats": ["1A", "1B"],
  "passengerName": "Harshil Agola",
  "passengerPhone": "9876543210"
}
```
