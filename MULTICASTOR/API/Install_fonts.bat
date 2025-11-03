@echo off
echo Installation des polices Raleway...
for %%f in ("%~dp0API\Installers\fonts\*.ttf") do (
    copy "%%f" "%WINDIR%\Fonts"
)
echo ✅ Polices installées.
pause