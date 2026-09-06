@echo off
echo ============================================
echo   NEXUS AI - QUICK DEPLOY TO VERCEL
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Deploying to Vercel...
echo.
npx vercel --prod --force --yes

echo.
echo ============================================
echo   DEPLOYMENT COMPLETE!
echo ============================================
echo.
echo Check your site: https://nexus-ai-psi.vercel.app
echo Dashboard: https://vercel.com/atulchoudhary7781-dots-projects/ai-web
echo.
pause
