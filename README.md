# Salesforce CRUD Dashboard

A full-stack web application that allows users to manage Salesforce records through a custom web dashboard instead of the native Salesforce interface.

The application uses **Salesforce OAuth 2.0** for authentication and the **Salesforce REST API** to perform CRUD operations on standard Salesforce objects.

## Features

- Salesforce OAuth 2.0 authentication with PKCE
- Manage Salesforce standard objects:
  - Account
  - Opportunity
  - Lead
  - Contact
  - Case
- View Salesforce records
- Create new records
- Update existing records
- Delete Salesforce records
- Dynamic field handling using Salesforce Metadata API
- Pagination with 20 records per request
- Responsive React-based dashboard
- Backend session management

## Tech Stack

### Frontend

- React
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express.js
- Axios
- Express Session

### Salesforce

- Salesforce REST API
- Salesforce Metadata API
- OAuth 2.0
- PKCE

### Deployment

- Render

## Architecture

```text
React Frontend
      |
      v
Node.js + Express Backend
      |
      v
Salesforce REST API
      |
      v
Account / Opportunity / Lead / Contact / Case