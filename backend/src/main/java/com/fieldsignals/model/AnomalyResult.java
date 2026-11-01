package com.fieldsignals.model;

import java.util.List;

public class AnomalyResult {
    private double latitude;
    private double longitude;
    private String selectedSeasonLabel; // e.g. "Rabi Season 2023 (Nov 1, 2023 - Apr 30, 2024, LST)"
    private int selectedSeasonValidDays;
    private int selectedSeasonExpectedDays;
    private double selectedSeasonCoverageRatio;
    private boolean selectedSeasonSufficientCoverage; // >= 90%

    // Temperature (T2M)
    private Double selectedSeasonMeanTemp; // °C
    private Double baselineMeanTemp; // °C (mean of qualifying baseline seasons)
    private Double tempAnomaly; // °C (selected - baseline)

    // Precipitation (PRECTOTCORR)
    private Double selectedSeasonTotalRain; // mm
    private Double baselineMeanTotalRain; // mm
    private Double rainAnomaly; // mm

    // Baseline metadata
    private int qualifyingBaselineSeasonsCount; // out of 29 candidate seasons (1991-2019)
    private int totalCandidateBaselineSeasons;  // 29
    private boolean baselineValid; // >= 24 qualifying seasons
    private List<Integer> includedBaselineStartYears;

    private String timeStandard; // "Local Solar Time (LST)"
    private String dataDisclaimer; // "NASA POWER MERRA-2 Reanalysis (0.5° x 0.625°). Not a direct farm measurement."

    public AnomalyResult() {
        this.timeStandard = "Local Solar Time (LST)";
        this.dataDisclaimer = "Data provided by NASA POWER MERRA-2 meteorological reanalysis (0.5° x 0.625° grid). Not a direct farm-level measurement.";
    }

    // Getters and Setters
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getSelectedSeasonLabel() { return selectedSeasonLabel; }
    public void setSelectedSeasonLabel(String selectedSeasonLabel) { this.selectedSeasonLabel = selectedSeasonLabel; }

    public int getSelectedSeasonValidDays() { return selectedSeasonValidDays; }
    public void setSelectedSeasonValidDays(int selectedSeasonValidDays) { this.selectedSeasonValidDays = selectedSeasonValidDays; }

    public int getSelectedSeasonExpectedDays() { return selectedSeasonExpectedDays; }
    public void setSelectedSeasonExpectedDays(int selectedSeasonExpectedDays) { this.selectedSeasonExpectedDays = selectedSeasonExpectedDays; }

    public double getSelectedSeasonCoverageRatio() { return selectedSeasonCoverageRatio; }
    public void setSelectedSeasonCoverageRatio(double selectedSeasonCoverageRatio) { this.selectedSeasonCoverageRatio = selectedSeasonCoverageRatio; }

    public boolean isSelectedSeasonSufficientCoverage() { return selectedSeasonSufficientCoverage; }
    public void setSelectedSeasonSufficientCoverage(boolean selectedSeasonSufficientCoverage) { this.selectedSeasonSufficientCoverage = selectedSeasonSufficientCoverage; }

    public Double getSelectedSeasonMeanTemp() { return selectedSeasonMeanTemp; }
    public void setSelectedSeasonMeanTemp(Double selectedSeasonMeanTemp) { this.selectedSeasonMeanTemp = selectedSeasonMeanTemp; }

    public Double getBaselineMeanTemp() { return baselineMeanTemp; }
    public void setBaselineMeanTemp(Double baselineMeanTemp) { this.baselineMeanTemp = baselineMeanTemp; }

    public Double getTempAnomaly() { return tempAnomaly; }
    public void setTempAnomaly(Double tempAnomaly) { this.tempAnomaly = tempAnomaly; }

    public Double getSelectedSeasonTotalRain() { return selectedSeasonTotalRain; }
    public void setSelectedSeasonTotalRain(Double selectedSeasonTotalRain) { this.selectedSeasonTotalRain = selectedSeasonTotalRain; }

    public Double getBaselineMeanTotalRain() { return baselineMeanTotalRain; }
    public void setBaselineMeanTotalRain(Double baselineMeanTotalRain) { this.baselineMeanTotalRain = baselineMeanTotalRain; }

    public Double getRainAnomaly() { return rainAnomaly; }
    public void setRainAnomaly(Double rainAnomaly) { this.rainAnomaly = rainAnomaly; }

    public int getQualifyingBaselineSeasonsCount() { return qualifyingBaselineSeasonsCount; }
    public void setQualifyingBaselineSeasonsCount(int qualifyingBaselineSeasonsCount) { this.qualifyingBaselineSeasonsCount = qualifyingBaselineSeasonsCount; }

    public int getTotalCandidateBaselineSeasons() { return totalCandidateBaselineSeasons; }
    public void setTotalCandidateBaselineSeasons(int totalCandidateBaselineSeasons) { this.totalCandidateBaselineSeasons = totalCandidateBaselineSeasons; }

    public boolean isBaselineValid() { return baselineValid; }
    public void setBaselineValid(boolean baselineValid) { this.baselineValid = baselineValid; }

    public List<Integer> getIncludedBaselineStartYears() { return includedBaselineStartYears; }
    public void setIncludedBaselineStartYears(List<Integer> includedBaselineStartYears) { this.includedBaselineStartYears = includedBaselineStartYears; }

    public String getTimeStandard() { return timeStandard; }
    public void setTimeStandard(String timeStandard) { this.timeStandard = timeStandard; }

    public String getDataDisclaimer() { return dataDisclaimer; }
    public void setDataDisclaimer(String dataDisclaimer) { this.dataDisclaimer = dataDisclaimer; }
}
