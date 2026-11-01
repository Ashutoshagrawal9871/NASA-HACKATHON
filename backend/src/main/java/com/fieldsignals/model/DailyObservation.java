package com.fieldsignals.model;

import java.util.List;

public class DailyObservation {
    private String date; // YYYYMMDD
    private Double t2m;           // Mean temperature °C
    private Double t2mMax;        // Max temperature °C
    private Double t2mMin;        // Min temperature °C
    private Double prectotcorr;   // Precipitation mm/day
    private Double allskySWRad;   // Solar irradiance MJ/m²/day

    public DailyObservation() {}

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public Double getT2m() { return t2m; }
    public void setT2m(Double t2m) { this.t2m = t2m; }

    public Double getT2mMax() { return t2mMax; }
    public void setT2mMax(Double t2mMax) { this.t2mMax = t2mMax; }

    public Double getT2mMin() { return t2mMin; }
    public void setT2mMin(Double t2mMin) { this.t2mMin = t2mMin; }

    public Double getPrectotcorr() { return prectotcorr; }
    public void setPrectotcorr(Double prectotcorr) { this.prectotcorr = prectotcorr; }

    public Double getAllskySWRad() { return allskySWRad; }
    public void setAllskySWRad(Double allskySWRad) { this.allskySWRad = allskySWRad; }
}
