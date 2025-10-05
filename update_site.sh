#!/bin/bash
# commit & push current files (mac/linux)
git add .
git commit -m "Auto update site"
git push origin main
echo "✅ Pushed to GitHub — Netlify/Vercel will auto-deploy if connected."
