<?php

namespace App\Helpers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OperationalTimeHelper
{
    /**
     * Devuelve el rango operativo [inicio, fin] para una fecha o rango de fechas.
     * Si se pasa solo $startDate ('2024-03-02'), el rango es de '2024-03-02 07:00:00' a '2024-03-03 06:59:59'.
     * Si se pasan ambas, el rango cubre desde el inicio de la primera hasta el fin de la segunda.
     */
    public static function getOperationalRange($startDate = null, $endDate = null)
    {
        $startDay = $startDate ? Carbon::parse($startDate) : Carbon::today();
        $endDay = $endDate ? Carbon::parse($endDate) : $startDay->copy();

        $start = $startDay->copy()->setTime(7, 0, 0);
        $end = $endDay->copy()->addDay()->setTime(6, 59, 59);

        return [
            $start->format('Y-m-d H:i:s'),
            $end->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Aplica el desplazamiento operativo de -7 horas a una columna en SQL.
     * Útil para GROUP BY y visualización de "Fecha Operativa".
     */
    public static function getSqlDateOffset($column)
    {
        return "DATE(DATE_SUB($column, INTERVAL 7 HOUR))";
    }

    /**
     * Convierte una fecha/hora real a su fecha operativa (string Y-m-d).
     */
    public static function getOperativeDate($dateTime)
    {
        $dt = Carbon::parse($dateTime);
        return $dt->hour < 7
            ? $dt->subDay()->format('Y-m-d')
            : $dt->format('Y-m-d');
    }
}
