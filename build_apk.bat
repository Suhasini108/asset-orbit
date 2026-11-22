@echo off
title Build AssetOrbit Android APK
echo ========================================================
echo   AssetOrbit - Building Native Android App (.APK)
echo ========================================================

if exist "C:\Program Files\Android\Android Studio\jbr" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    set "PATH=C:\Program Files\Android\Android Studio\jbr\bin;%PATH%"
)

echo Step 1: Syncing web assets...
call npx cap sync android
echo.
echo Step 2: Compiling Android APK...
cd android
call gradlew.bat assembleDebug
echo.
echo ========================================================
echo APK Generated successfully at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================================
pause
