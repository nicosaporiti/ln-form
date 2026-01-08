# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based Lightning Network payment form application that enables Bitcoin payments through the Lightning Network. It generates payment invoices via a backend API (see companion repo: https://github.com/nicosaporiti/buda-lightning-invoice) and displays QR codes for wallet scanning.

The application uses a **3-step carousel flow**:
1. **Step 1 - Data Form**: User enters amount, message, and selects currency
2. **Step 2 - QR/Invoice**: Displays QR code for payment with polling for confirmation
3. **Step 3 - Confirmation**: Shows success message with option to create new payment

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (default port 3000)
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Environment Configuration

Required environment variables (see `.env-sample`):

```
REACT_APP_API_URL_INVOICE='https://myapi.com/newinvoice'
REACT_APP_API_URL_STATUS='https://myapi.com/status'
REACT_APP_API_USER='username'
REACT_APP_API_USER_IMAGE='url User Image'
```

## Architecture

### Directory Structure

```
src/
├── components/
│   ├── PayForm.js              # Main orchestrator component
│   ├── steps/
│   │   ├── StepIndicator.js    # Semantic UI Step visual indicator
│   │   ├── Step1DataForm.js    # Form for amount, message, currency
│   │   ├── Step2QRInvoice.js   # QR code display + payment polling
│   │   └── Step3Confirmation.js # Success message + reset
│   ├── PaymentLink.js          # Shareable payment link generator
│   ├── Profile.js              # User profile display
│   └── payform.css             # Styles including Step theming
├── hooks/
│   └── usePaymentVerification.js # Payment polling with cleanup
├── reducers/
│   └── paymentReducer.js       # Centralized state management
├── helpers/
│   ├── getInvoice.js           # Generate LN invoice via API
│   ├── getPaymentStatus.js     # Check payment status
│   ├── getBtcPrice.js          # Fetch BTC price from CoinGecko
│   └── getCurrencies.js        # Available currency options
└── utils/
    └── base64.js               # Encode/decode for deep linking
```

### State Management

Uses `useReducer` for centralized state management with actions:
- `SET_INITIAL_DATA` - Initialize BTC price and currencies
- `SET_AMOUNT` / `SET_MESSAGE` - Form input updates
- `SET_CURRENCY` - Currency change with price update
- `GENERATE_INVOICE` - Store generated invoice
- `CONFIRM_PAYMENT` - Mark payment as confirmed
- `RESET` - Reset to initial state for new payment

### Payment Verification Hook

`usePaymentVerification.js` handles polling with:
- Proper cleanup function (no memory leaks)
- Exponential backoff (5s → 30s)
- Maximum 60 attempts (~10-15 min timeout)
- setTimeout instead of setInterval to prevent overlapping requests

### Payment Flow

1. **Step 1**: User enters amount/message → validates → calls `getInvoice()` → moves to Step 2
2. **Step 2**: Shows QR code → `usePaymentVerification` polls `/status` → on success moves to Step 3
3. **Step 3**: Shows confirmation → auto-resets after 7 seconds OR manual button → returns to Step 1

### Deep Linking

URL format: `https://domain.com/?base64EncodedString`
Decoded params: `amount=10000&memo=payment&curr=clp`

When deep link params exist, app skips directly to Step 2 with auto-generated invoice.

## Technical Stack

- **React 17** with functional components and hooks
- **useReducer** for state management
- **Semantic UI React** for UI components (including Step indicator)
- **SweetAlert2** for toast notifications
- **qrcode.react** for QR code generation
- **react-copy-to-clipboard** for clipboard functionality
- **CoinGecko API** for BTC price data (no auth required)

## Backend Integration

This frontend requires a separate backend API:

1. **POST /newinvoice**
   - Body: `{ amount: number (satoshis), msg: string }`
   - Returns: `{ invoice: string, amount: number, msg: string }`

2. **POST /status**
   - Body: `{ invoice: string }`
   - Returns: `{ invoice: string, status: boolean }`

Reference backend: https://github.com/nicosaporiti/buda-lightning-invoice

## Color Palette

- Primary (yellow): `#fbbd08` - Buttons, accents, active steps
- Background: `#303135` - Main background
- Secondary: `#806514` - Links, hover states
- Gray: `#3a3b3c` - Dividers, inactive steps

## Deployment Notes

- Designed for Netlify or similar static hosting
- Build output: `build/` directory
- Ensure environment variables are configured in hosting platform
- Backend API must be CORS-enabled
