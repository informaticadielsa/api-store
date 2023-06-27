@echo off
SetLocal EnableDelayedExpansion
chcp 65001

ECHO ---------------------------------------------------------------------- 
ECHO Bat Correr Scripts PostgreSQL
ECHO ---------------------------------------------------------------------- 
SET _server=LOCALHOST
SET _sqlPort=5432
SET _sqlUser=postgres
SET _sqlBD=punto_ecommerces
SET _sqlPass=123456
set cont=0

SET mypath=%~dp0


ECHO DEFAULTS (h=%_server%,p=%_sqlPort%,u=%_sqlUser%,bd=%_sqlBD%,pass=%_sqlPass%)
ECHO ---------------------------------------------------------------------- 

SET /P _sqlBD=Base Datos (default: %_sqlBD%): 
SET /P _sqlPass=Pass (default: %_sqlPass%): 

set PGPASSWORD=%_sqlPass%


ECHO ---------------------------------------------------------------------- 
ECHO Empezar

psql -h %_server% -U %_sqlUser% -d %_sqlBD% -p %_sqlPort% -qtA -c "select cmm_valor::bigint as v from controles_maestros_multiples where cmm_nombre = 'SYS_SCRIPT'"  > _last.txt
set /p _lastScript=<_last.txt


ECHO ---------------------------------------------------------------------- 
ECHO Ultimo
ECHO %_lastScript%
ECHO ---------------------------------------------------------------------- 

pause
:Loop 
For %%X in (*.sql) do ( 

	set _sqlFile=%%X
	set _sqlFile=!_sqlFile:~0,10!

	if !_sqlFile! GTR !_lastScript! (
			ECHO * & echo.* & echo.****************************************************** & echo.%%X & echo.******************************************************  
			psql -h %_server% -U %_sqlUser% -d %_sqlBD% -p %_sqlPort% --tuples-only -f "%%X"
			ECHO ----------------------------------------------------------------------
			PAUSE
			psql -h %_server% -U %_sqlUser% -d %_sqlBD% -p %_sqlPort% -c "UPDATE controles_maestros_multiples SET cmm_valor = '!_sqlFile!' where cmm_nombre = 'SYS_SCRIPT'"
			set /A cont=!cont!+1
	)

)

ECHO ---------------------------------------------------------------------- 
ECHO Scripts Corridos
ECHO (%cont% Scripts)
ECHO ---------------------------------------------------------------------- 


pause