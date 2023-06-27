@echo off
SetLocal EnableDelayedExpansion
chcp 65001

ECHO ---------------------------------------------------------------------- 
ECHO Bat Formato Script
ECHO ---------------------------------------------------------------------- 


FOR %%i IN ("%1") DO (
set _filename=!_filename! %%~ni
set _fileextension=%%~xi
)

ECHO %_filename%
ECHO ---------------------------------------------------------------------- 

For /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set _year=%%c)
For /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set _day=%%a)
For /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set _month=%%b)
For /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set _hour=%%a)
For /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set _min=%%b)


set _zero=0
set _hour=%_hour: =!_zero!%


SET _nombre=%ComputerName%
SET _descripcion=%_filename%

SET /P _nombre=Nombre Completo (default: %_nombre%): 
SET /P _descripcion=Descripcion (default: %_descripcion%): 


echo -- ============================================= >>tmp_formato.txt
echo -- Author:		%_nombre% >>tmp_formato.txt
echo -- Create date: %_year%/%_month%/%_day% >>tmp_formato.txt
echo -- Description:	%_descripcion% >>tmp_formato.txt
echo -- --------------------------------------------- >>tmp_formato.txt
echo -- >>tmp_formato.txt
echo -- >>tmp_formato.txt
echo SET statement_timeout = 0; >>tmp_formato.txt
echo SET lock_timeout = 0; >>tmp_formato.txt
echo SET client_encoding = 'UTF8'; >>tmp_formato.txt
echo SET standard_conforming_strings = on; >>tmp_formato.txt
echo SET check_function_bodies = false; >>tmp_formato.txt
echo SET client_min_messages = warning; >>tmp_formato.txt
echo SET row_security = off; >>tmp_formato.txt
echo SET search_path = public, pg_catalog; >>tmp_formato.txt
echo SET default_tablespace = ''; >>tmp_formato.txt
echo SET default_with_oids = false; >>tmp_formato.txt
echo -- >>tmp_formato.txt
echo -- >>tmp_formato.txt

type %1 >> tmp_formato.txt
del %1
ren tmp_formato.txt "%_year:~2,4%%_month%%_day%%_hour%%_min:~0,2% -%_filename%.sql"