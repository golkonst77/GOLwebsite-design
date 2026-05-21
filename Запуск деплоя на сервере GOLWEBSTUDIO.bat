@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ======================================================
REM GOL Web Studio deploy script
REM Server: 144.31.253.4
REM Site: golwebstudio.ru
REM Project: /var/www/golwebstudio
REM ======================================================

set "EXIT_CODE=0"

REM --- Configuration ---
SET SSH_USER=root
SET SSH_HOST=144.31.253.4
SET PROJECT_PATH=/var/www/golwebstudio
SET APP_NAME=golwebstudio
SET BRANCH=main
SET SITE_URL=http://144.31.253.4
SET DOMAIN=golwebstudio.ru

REM If you use SSH key, uncomment and set path:
REM SET SSH_KEY_PATH=C:\Users\SuperBoss007\.ssh\id_rsa

REM --- SSH command setup ---
if defined SSH_KEY_PATH (
    if not exist "%SSH_KEY_PATH%" (
        echo.
        echo ======================================================
        echo [ERROR] SSH KEY NOT FOUND!
        echo ======================================================
        echo [ERROR] SSH key not found at: %SSH_KEY_PATH%
        echo.
        set "EXIT_CODE=1"
        goto :END
    )
    set "SSH_CMD=ssh -t -i "%SSH_KEY_PATH%" %SSH_USER%@%SSH_HOST%"
) else (
    set "SSH_CMD=ssh -t %SSH_USER%@%SSH_HOST%"
)

echo.
echo ======================================================
echo Starting deployment for GOL Web Studio...
echo ======================================================
echo.
echo [INFO] Server: %SSH_USER%@%SSH_HOST%
echo [INFO] Project path: %PROJECT_PATH%
echo [INFO] PM2 app: %APP_NAME%
echo [INFO] Branch: %BRANCH%
echo [INFO] Site: %SITE_URL%
echo [INFO] Domain: %DOMAIN%
echo.

REM --- Run deploy on server ---
echo [STEP 1] Running remote deployment...
%SSH_CMD% "bash -lc 'set -e; echo [SERVER] Current directory: $(pwd); echo [SERVER] Going to project: %PROJECT_PATH%; cd %PROJECT_PATH%; echo [SERVER] Fetching latest code...; git fetch origin %BRANCH%; git reset --hard origin/%BRANCH%; echo [SERVER] Installing dependencies...; if command -v pnpm >/dev/null 2>&1; then pnpm install; else npm install -g pnpm && pnpm install; fi; echo [SERVER] Building project...; pnpm build; echo [SERVER] Restarting PM2 app...; if pm2 describe %APP_NAME% >/dev/null 2>&1; then pm2 restart %APP_NAME%; else pm2 start pnpm --name %APP_NAME% -- start; fi; pm2 save; echo [SERVER] Testing nginx config...; nginx -t; echo [SERVER] Reloading nginx...; systemctl reload nginx; echo [SERVER] Deployment finished successfully.'"
set "DEPLOY_EXIT_CODE=%ERRORLEVEL%"

echo.
echo [INFO] Deployment process completed with exit code: %DEPLOY_EXIT_CODE%

if %DEPLOY_EXIT_CODE% equ 0 (
    echo.
    echo ======================================================
    echo [SUCCESS] DEPLOYMENT SUCCESSFUL!
    echo ======================================================
    echo [SUCCESS] GOL Web Studio deployed successfully.
    echo [INFO] Check by IP: %SITE_URL%
    echo [INFO] Check domain when DNS is ready: http://%DOMAIN%
    echo [INFO] Server: %SSH_HOST%
    echo [INFO] Time: %DATE% %TIME%
) else (
    echo.
    echo ======================================================
    echo [ERROR] DEPLOYMENT FAILED!
    echo ======================================================
    echo [ERROR] Deployment completed with errors.
    echo [ERROR] Exit code: %DEPLOY_EXIT_CODE%
    echo.
    echo [INFO] Common issues:
    echo [INFO]   - SSH connection problem
    echo [INFO]   - GitHub repository is private or token/key is not configured
    echo [INFO]   - Build errors in Next.js
    echo [INFO]   - pnpm/node/pm2 problem
    echo [INFO]   - nginx configuration error
    set "EXIT_CODE=1"
)

:END
echo.
echo ======================================================
echo DEPLOYMENT SCRIPT COMPLETED
echo ======================================================
echo.
if %EXIT_CODE% equ 0 (
    echo [SUCCESS] Script completed successfully.
    echo [INFO] Window will stay open for 30 seconds...
    echo [INFO] Press any key to close immediately.
    timeout /t 30 /nobreak >nul 2>&1
) else (
    echo [ERROR] Script completed with errors.
    echo [INFO] Window will stay open for 120 seconds so you can read the errors...
    echo [INFO] Press any key to close immediately.
    timeout /t 120 /nobreak >nul 2>&1
)

exit /b %EXIT_CODE%
