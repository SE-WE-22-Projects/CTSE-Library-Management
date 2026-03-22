# CTSE-Library-Management

## Services

### Lending Service

Base URL: `http://localhost:3002/api/lendings`

#### CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Create a new lending record |
| `GET` | `/` | Get all lending records |
| `GET` | `/:id` | Get lending record by ID |
| `PUT` | `/:id` | Update lending record by ID |
| `DELETE` | `/:id` | Delete lending record by ID |

#### History & Query Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/history` | Get all lending history records |
| `GET` | `/history/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` | Get lending history by date range |
| `GET` | `/history/user/:userId` | Get lending history by user ID |
| `GET` | `/history/book/:bookId` | Get lending history by book ID |

#### Action Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/:id/extend` | Extend lending by 7 days (max 2 attempts) |
| `PATCH` | `/:id/return` | Mark lending as returned |

#### Admin/Jobs Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/jobs/fines/apply` | Manually trigger overdue fine calculation for all active loans |

#### Request/Response Examples

##### Create Lending
```json
POST /api/lendings
{
  "bookId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012"
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439013",
  "bookId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "reservedDate": "2026-03-22T00:00:00.000Z",
  "returnDate": "2026-04-05T00:00:00.000Z",
  "extensionAttempts": 0,
  "fineAmount": 0,
  "isActive": true,
  "status": "ACTIVE"
}
```

##### Extend Lending
```json
PATCH /api/lendings/:id/extend

Response (200):
{
  "_id": "507f1f77bcf86cd799439013",
  "returnDate": "2026-04-12T00:00:00.000Z",
  "extensionAttempts": 1,
  "status": "ACTIVE"
}
```

##### Return Lending
```json
PATCH /api/lendings/:id/return

Response (200):
{
  "_id": "507f1f77bcf86cd799439013",
  "actualReturnDate": "2026-04-05T10:30:00.000Z",
  "isActive": false,
  "status": "RETURNED"
}
```

#### Rules & Business Logic

- **Lending Period**: 14 days from `reservedDate`
- **Extension**: Max 2 attempts, +7 days per attempt (allowed only on or before due date)
- **Overdue Fine**: $0.50/day after `returnDate`, accrued daily
- **Active Lending**: Only 1 active lending per `bookId`
- **Fine Accrual**: Runs daily via scheduled job; manual trigger via `/jobs/fines/apply`

#### Status Values

- `ACTIVE` - Lending in progress
- `RETURNED` - Book returned on time
- `OVERDUE` - Return date passed, fines accruing

#### Swagger Documentation

Access interactive API docs:
- `http://localhost:3002/api/docs` (Swagger UI)
