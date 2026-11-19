@echo off
echo ====================================================================
echo   AssetOrbit - Pushing to GitHub (Suhasini108/asset-orbit)
echo ====================================================================
echo.
echo Make sure you have created the empty repository on GitHub first:
echo   1. Visit https://github.com/new
echo   2. Repository name: asset-orbit
echo   3. Leave README and .gitignore UNCHECKED
echo   4. Click "Create repository"
echo.
echo Pushing local main branch to remote origin...
git branch -M main
git push -u origin main
echo.
echo ====================================================================
pause
