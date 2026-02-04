# EvidEx Official Website

Professional marketing website for EvidEx - Inventory & Order Management desktop application.

## 🚀 Features

- **5 Pages**: Home, App Details, Download, Pricing, Support
- **Responsive Design**: Mobile-first, works on all devices
- **SEO Optimized**: Meta tags, semantic HTML, fast loading
- **Vercel Ready**: Deploy with one click
- **Design System**: Matches desktop app's purple theme and dark mode

## 📦 Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- React Helmet (SEO)
- Lucide Icons

## 🛠️ Development

### Install Dependencies

```bash
cd website
npm install
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in `/dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Vercel will auto-detect Vite and deploy
4. Done! Your site is live

Or use Vercel CLI:

```bash
npm install -g vercel
vercel
```

### Environment Variables

No environment variables required for basic deployment.

## 📁 Project Structure

```
website/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   ├── layout/     # Header, Footer, Layout
│   │   └── ui/         # Button, Card, Badge
│   ├── pages/          # All page components
│   ├── lib/            # Utilities
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json         # Vercel config
```

## 🎨 Design System

The website uses the same design system as the desktop app:

- **Primary Color**: Purple (`hsl(262, 83%, 58%)`)
- **Font**: Inter
- **Theme**: Dark mode
- **Effects**: Glass morphism, smooth animations

## 📝 Content

- **App Name**: EvidEx
- **Tagline**: Inventory Management with Tamper-Proof Evidence
- **Pricing**: ₹999 (Starter), ₹2,499 (Pro)
- **Trial**: 7 days free
- **Platform**: Windows only

## 🔗 Links

- Home: `/`
- Features: `/app-details`
- Download: `/download`
- Pricing: `/pricing`
- Support: `/support`

## 📧 Support

For questions or issues, contact: support@evidex.com

## 📄 License

© 2026 EvidEx. All rights reserved.
