# Quick Start: Deploy to Render

## 🚀 Quick Deployment Steps

### 1. Backend Deployment (5 minutes)

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New +** → **Web Service**
2. Connect GitHub repo → Select `UBHacking`
3. Configure:
   - **Name**: `flowworks-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variable:
   - `GEMINI_API_KEY` = `your_api_key_here`
5. Click **Create Web Service**
6. **Copy the backend URL** (e.g., `https://flowworks-backend.onrender.com`)

### 2. Frontend Deployment (5 minutes)

1. **New +** → **Web Service** → Same repo
2. Configure:
   - **Name**: `flowworks-frontend`
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://flowworks-backend.onrender.com` (your backend URL)
4. Click **Create Web Service**
5. **Copy the frontend URL**

### 3. Update Backend CORS (2 minutes)

1. Go to backend service → **Environment** tab
2. Add Environment Variable:
   - `FRONTEND_URL` = `https://flowworks-frontend.onrender.com` (your frontend URL)
3. Go to **Manual Deploy** → **Deploy latest commit**

### 4. Test

- Backend: `https://your-backend-url.onrender.com/health`
- Frontend: `https://your-frontend-url.onrender.com`

---

## 📋 Environment Variables Checklist

### Backend:
- ✅ `GEMINI_API_KEY` - Your Gemini API key
- ✅ `FRONTEND_URL` - Your frontend URL (after frontend is deployed)

### Frontend:
- ✅ `NEXT_PUBLIC_API_URL` - Your backend URL

---

## ⚠️ Important Notes

- Free tier services spin down after 15 min inactivity
- First request after spin-down takes ~30-50 seconds
- For production, consider upgrading to paid plan

---

## 📖 Full Guide

See `RENDER_DEPLOYMENT.md` for detailed instructions and troubleshooting.

