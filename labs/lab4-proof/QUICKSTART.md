# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Node.js
If you don't have Node.js installed:
- Download from: https://nodejs.org/
- Choose the LTS version
- Run the installer

### 2. Setup the App
```bash
# Run the setup script
.\setup.ps1

# OR manually:
npm install
copy env.template .env.local
```

### 3. Start Your API
In a new terminal, go to your `lab4-proof` directory:
```bash
cd ..\lab4-proof
uvicorn app.main:app --reload --port 8000
```

### 4. Start the Frontend
In this terminal:
```bash
npm run dev
```

### 5. Open Your Browser
Go to: http://localhost:3000

## 🎯 First Use

1. **Seed your day**: Click "Seed" to start
2. **Write a reflection**: Type your thoughts
3. **Choose reward tier**:
   - **Private (+10 GIC)**: Keep it private
   - **Publish (+25 GIC)**: Share to civic library (200+ chars)
4. **Select chamber**: Pick your context
5. **Seal the day**: Complete your cycle

## 🔧 Troubleshooting

### "Backend: offline ❌"
- Make sure your API is running on port 8000
- Check that `NEXT_PUBLIC_BACKEND_URL` in `.env.local` is correct

### "Module not found" errors
- Run `npm install` again
- Make sure you're in the `reflections` directory

### API connection issues
- Verify your API server is running: http://127.0.0.1:8000/health
- Check the API logs for errors

## 📱 Features

- **Dark theme**: Easy on the eyes
- **Mobile responsive**: Works on phone and desktop
- **Real-time GIC tracking**: See your rewards instantly
- **Chamber selection**: Organize by context
- **Ledger verification**: Check daily integrity
- **Export capabilities**: Download your data

## 🎨 Customization

Edit `src/app/page.tsx` to:
- Change the color scheme
- Add new chambers
- Modify the UI layout
- Add new features

Edit `src/lib/api.ts` to:
- Add new API endpoints
- Modify request/response handling
- Add authentication

## 🚀 Deployment

When ready to go live:

1. **Deploy API to Render**:
   - Connect your GitHub repo
   - Set environment variables
   - Deploy

2. **Update frontend**:
   - Change `NEXT_PUBLIC_BACKEND_URL` to your Render URL
   - Deploy to Vercel/Netlify

3. **Test everything**:
   - Verify API health
   - Test all features
   - Check mobile responsiveness

Happy reflecting! ✨
