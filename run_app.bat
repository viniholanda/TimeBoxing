@echo off
cd /d "%~dp0"
echo Iniciando o TimeBoxing...
echo O navegador abrira automaticamente quando o servidor estiver pronto.
npm run dev -- --open
pause
