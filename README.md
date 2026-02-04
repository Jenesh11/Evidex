# Evidex

A production-ready, local-first Windows desktop application for warehouse inventory and order management with integrated packing video recording and tamper-proof evidence system.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎨 Premium UI/UX
- Modern SaaS-grade interface with dark/light themes
- Smooth animations and micro-interactions
- Touch-friendly buttons for warehouse use
- Responsive and accessible design

### 📦 Inventory Management
- Complete product CRUD operations
- SKU-based stock tracking
- Low stock alerts
- Stock movement history
- Search and filter capabilities

### 🛒 Order Management
- Manual order creation
- Multi-item orders
- Order status workflow: NEW → PACKING → PACKED → SHIPPED → DELIVERED → RETURN → RTO
- Order details and history

### 🎥 Packing Video System
- Live camera preview
- Video recording with watermark overlay
- Burn-in metadata: Order ID, Date/Time, Staff name
- SHA-256 hash generation
- File locking (read-only)
- Tamper detection

### 🔄 Returns & RTO Management
- Return/RTO tracking
- Video evidence viewer
- Tamper detection indicators
- Inspection notes and checklists

### 👥 Staff Management
- User account management
- Role-based access control (Admin/Packer)
- Activity audit logs
- Last login tracking

### 🔒 Security Features
- Role-based permissions
- Immutable audit logs
- Video integrity verification
- Local-first architecture

## 🛠 Tech Stack

- **Desktop Framework**: Electron
- **Frontend**: React 18 + Vite
- **UI Library**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Database**: SQLite (better-sqlite3)
- **Video Processing**: MediaDevices API + FFmpeg
- **Build**: electron-builder

## 📋 Prerequisites

- Node.js 18+ and npm
- Windows 10/11
- Webcam (for video recording feature)

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Run in Development Mode

\`\`\`bash
npm run dev
\`\`\`

This will:
- Start the Vite dev server on `http://localhost:5173`
- Launch the Electron app
- Enable hot module replacement

### 3. Login

Use the default admin credentials:
- **Username**: `admin`
- **Password**: `admin`

## 🏗 Build for Production

### Build Windows Installer

\`\`\`bash
npm run build:win
\`\`\`

This will create a Windows installer in the `dist-electron` directory.

## 📁 Project Structure

\`\`\`
Build/
├── electron/                 # Electron main process
│   ├── main.js              # Main entry point
│   ├── preload.js           # Context bridge
│   └── ipc/                 # IPC handlers
│       ├── database.js      # Database operations
│       ├── video.js         # Video management
│       └── auth.js          # Authentication
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── layout/         # Layout components
│   ├── contexts/           # React contexts
│   ├── pages/              # Application pages
│   ├── lib/                # Utilities
│   ├── database/           # Database schema & config
│   ├── App.jsx             # Main app component
│   └── index.css           # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
\`\`\`

## 💾 Data Storage

All data is stored locally in:

\`\`\`
%APPDATA%/InventoryApp/
├── videos/                  # Organized by date (YYYY-MM-DD)
├── images/                  # Product images
├── backups/                 # Database backups
├── logs/                    # Application logs
└── inventory.db            # SQLite database
\`\`\`

## 🎯 Usage Guide

### Adding Products

1. Navigate to **Inventory**
2. Click **Add Product**
3. Fill in SKU, name, description, quantity, price
4. Set low stock threshold
5. Click **Create Product**

### Creating Orders

1. Navigate to **Orders**
2. Click **New Order**
3. Enter customer details
4. Add order items (select products and quantities)
5. Click **Create Order**

### Recording Packing Videos

1. Navigate to **Packing Camera**
2. Select an order from the list
3. Camera preview will start automatically
4. Click **Start Recording**
5. Pack the order (watermark will be visible)
6. Click **Stop Recording**
7. Video is automatically saved with hash

### Viewing Returns

1. Navigate to **Returns & RTO**
2. Click on a return to view details
3. View video evidence
4. Check tamper detection status
5. Add inspection notes

### Managing Staff

1. Navigate to **Staff** (Admin only)
2. Click **Add Staff**
3. Enter username, password, full name
4. Select role (Admin/Packer)
5. Click **Create Staff**

## 🔐 Roles & Permissions

### Admin
- Full access to all features
- Manage staff accounts
- View audit logs
- Manage inventory, orders, returns

### Packer
- View orders
- Record packing videos
- Update order status
- Limited inventory access

## 🎥 Video Tamper Detection

The system ensures video integrity through:

1. **SHA-256 Hashing**: Generated immediately after recording
2. **File Locking**: Videos are set to read-only
3. **Verification**: Hash is recalculated and compared on access
4. **Status Indicator**: Clear visual feedback if tampering detected

## 📊 Database Schema

Key tables:
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `videos` - Packing videos with hashes
- `staff` - User accounts
- `stock_movements` - Inventory changes
- `returns` - Return/RTO records
- `audit_logs` - Immutable activity logs

## 🔧 Configuration

### Camera Settings

The app uses default camera settings:
- Resolution: 1280x720
- Format: WebM (VP9 codec)
- Audio: Enabled

### Database Backup

Backups can be triggered manually via the system menu or programmatically:

\`\`\`javascript
await window.electronAPI.system.backup();
\`\`\`

## 🐛 Troubleshooting

### Camera Not Working

1. Check camera permissions in Windows Settings
2. Ensure no other app is using the camera
3. Try restarting the application

### Database Errors

1. Check if database file is locked
2. Verify write permissions in AppData folder
3. Restore from backup if corrupted

### Build Issues

1. Clear node_modules and reinstall: `npm ci`
2. Clear build cache: `rm -rf dist dist-electron`
3. Rebuild: `npm run build:win`

## 📝 Development

### Adding New Features

1. Create database migrations in `src/database/schema.sql`
2. Add IPC handlers in `electron/ipc/`
3. Create React components in `src/components/`
4. Add routes in `src/App.jsx`

### Code Style

- Use ES6+ features
- Follow React best practices
- Use Tailwind utility classes
- Maintain consistent naming conventions

## 🤝 Contributing

This is a production application. For modifications:

1. Test thoroughly in development
2. Update documentation
3. Maintain backward compatibility
4. Follow existing code patterns

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the usage guide
3. Check application logs in `%APPDATA%/InventoryApp/logs/`

## 🎉 Credits

Built with:
- React + Vite
- Electron
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Framer Motion

---

**Made with ❤️ for warehouse management**
