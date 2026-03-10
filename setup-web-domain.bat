@echo off
echo Adding web.local to hosts file...
echo 127.0.0.1    web.local >> %SystemRoot%\System32\drivers\etc\hosts
echo Done! You can now access your frontend at: http://web.local:8080
pause