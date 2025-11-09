# Step-by-Step Guide: Deploy FlowWorks to Render

This guide will help you deploy both the Next.js frontend and FastAPI backend to Render.

## Prerequisites

1. A [Render.com](https://render.com) account (free tier available)
2. A GitHub repository with your code pushed
3. A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

---

## Part 1: Deploy the Backend (FastAPI)

### Step 1: Prepare Backend for Production

1. **Update CORS settings** (already done in `backend/main.py` - we'll update it to accept production URLs)

### Step 2: Create a Render Web Service for Backend

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository: `UBHacking`

### Step 3: Configure Backend Service

**Basic Settings:**
- **Name**: `flowworks-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Environment Variables:**
Click **"Add Environment Variable"** and add:
- `GEMINI_API_KEY` = `your_gemini_api_key_here`
- `PORT` = `10000` (Render will override this, but good to have)

**Advanced Settings:**
- **Auto-Deploy**: `Yes` (deploys on every push to main)
- **Plan**: Free tier is fine to start

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (usually 2-5 minutes)
3. Copy the service URL (e.g., `https://flowworks-backend.onrender.com`)
4. Test the health endpoint: `https://your-backend-url.onrender.com/health`

---

## Part 2: Deploy the Frontend (Next.js)

### Step 1: Create a Render Web Service for Frontend

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect the same GitHub repository
3. Select your repository: `UBHacking`

### Step 2: Configure Frontend Service

**Basic Settings:**
- **Name**: `flowworks-frontend` (or your preferred name)
- **Region**: Same as backend (for lower latency)
- **Branch**: `main`
- **Root Directory**: `.` (root of repository)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Environment Variables:**
Click **"Add Environment Variable"** and add:
- `NEXT_PUBLIC_API_URL` = `https://your-backend-url.onrender.com`
  - Replace `your-backend-url` with your actual backend URL from Part 1

**Advanced Settings:**
- **Auto-Deploy**: `Yes`
- **Plan**: Free tier is fine to start

### Step 3: Deploy Frontend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (usually 3-7 minutes)
3. Copy the service URL (e.g., `https://flowworks-frontend.onrender.com`)

---

## Part 3: Update Backend CORS for Production

After deploying the frontend, you need to update the backend CORS to allow your frontend URL.

### Step 1: Update CORS in Backend

1. Go to your backend service in Render Dashboard
2. Go to **"Environment"** tab
3. Add environment variable:
   - `FRONTEND_URL` = `https://your-frontend-url.onrender.com`
4. The backend code will automatically use this (we'll update the code to read from env)

### Step 2: Redeploy Backend

1. Go to **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for redeployment

---

## Part 4: Testing Your Deployment

1. **Test Backend Health:**
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status":"healthy"}`

2. **Test Frontend:**
   - Visit: `https://your-frontend-url.onrender.com`
   - Try generating a workflow
   - Check browser console for any errors

3. **Common Issues:**
   - **CORS errors**: Make sure `FRONTEND_URL` is set correctly in backend
   - **API connection errors**: Verify `NEXT_PUBLIC_API_URL` matches your backend URL
   - **Build failures**: Check build logs in Render dashboard

---

## Part 5: Using Render Blueprint (Alternative - Automated Setup)

If you prefer automated setup, you can use the `render.yaml` file:

1. Push `render.yaml` to your repository
2. In Render Dashboard, click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically create both services
5. Add environment variables manually in each service

---

## Important Notes

### Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30-50 seconds (cold start)
- Consider upgrading to paid plan for production use

### Environment Variables Summary:

**Backend:**
- `GEMINI_API_KEY` - Your Google Gemini API key
- `FRONTEND_URL` - Your frontend URL (for CORS)
- `PORT` - Automatically set by Render

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Your backend URL

### Custom Domain (Optional):
1. Go to your service settings
2. Click **"Custom Domains"**
3. Add your domain
4. Update DNS records as instructed

---

## Troubleshooting

### Backend won't start:
- Check build logs in Render dashboard
- Verify `requirements.txt` is correct
- Ensure `main.py` is in the `backend/` directory

### Frontend can't connect to backend:
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS settings
- Test backend health endpoint directly

### Build fails:
- Check Node.js/Python version compatibility
- Review build logs for specific errors
- Ensure all dependencies are in `package.json`/`requirements.txt`

---

## Next Steps

1. Set up monitoring (Render provides basic logs)
2. Configure custom domain
3. Set up database if needed (Render PostgreSQL available)
4. Consider upgrading plan for better performance

---

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- Check your service logs in Render Dashboard for detailed error messages

