package com.fieldsignals.model;

public class SeasonRequest {
    private double latitude;
    private double longitude;
    private String startMonthDay; // Format MM-DD, e.g. "11-01"
    private String endMonthDay;   // Format MM-DD, e.g. "04-30"
    private int selectedYear;     // e.g. 2023 for Nov 2023 - Apr 2024 season

    public SeasonRequest() {}

    public SeasonRequest(double latitude, double longitude, String startMonthDay, String endMonthDay, int selectedYear) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.startMonthDay = startMonthDay;
        this.endMonthDay = endMonthDay;
        this.selectedYear = selectedYear;
    }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getStartMonthDay() { return startMonthDay; }
    public void setStartMonthDay(String startMonthDay) { this.startMonthDay = startMonthDay; }

    public String getEndMonthDay() { return endMonthDay; }
    public void setEndMonthDay(String endMonthDay) { this.endMonthDay = endMonthDay; }

    public int getSelectedYear() { return selectedYear; }
    public void setSelectedYear(int selectedYear) { this.selectedYear = selectedYear; }
}
