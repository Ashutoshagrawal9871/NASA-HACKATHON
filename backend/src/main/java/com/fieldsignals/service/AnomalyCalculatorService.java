package com.fieldsignals.service;

import com.fieldsignals.model.AnomalyResult;
import com.fieldsignals.model.DailyObservation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AnomalyCalculatorService {

    @Autowired
    private NasaPowerService nasaPowerService;

    public AnomalyResult calculateSeasonalAnomaly(double latitude, double longitude, String startMMDD, String endMMDD, int selectedYear) {
        AnomalyResult result = new AnomalyResult();
        result.setLatitude(latitude);
        result.setLongitude(longitude);
        result.setSelectedSeasonLabel(formatSeasonLabel(startMMDD, endMMDD, selectedYear));

        // 1. Fetch Selected Season Data
        String selectedStart = String.format("%d-%s", selectedYear, startMMDD);
        int selectedEndYear = (startMMDD.compareTo(endMMDD) > 0) ? selectedYear + 1 : selectedYear;
        String selectedEnd = String.format("%d-%s", selectedEndYear, endMMDD);

        List<DailyObservation> selectedObs = nasaPowerService.fetchDailyData(latitude, longitude, selectedStart, selectedEnd);
        int expectedDays = calculateExpectedDays(startMMDD, endMMDD);
        result.setSelectedSeasonExpectedDays(expectedDays);

        int validTempDays = 0;
        int validRainDays = 0;
        double sumTemp = 0.0;
        double sumRain = 0.0;

        for (DailyObservation obs : selectedObs) {
            if (obs.getT2m() != null) {
                validTempDays++;
                sumTemp += obs.getT2m();
            }
            if (obs.getPrectotcorr() != null) {
                validRainDays++;
                sumRain += obs.getPrectotcorr();
            }
        }

        result.setSelectedSeasonValidDays(validTempDays); // Default to temp valid days
        double coverageTemp = expectedDays > 0 ? (double) validTempDays / expectedDays : 0.0;
        double coverageRain = expectedDays > 0 ? (double) validRainDays / expectedDays : 0.0;
        result.setSelectedSeasonCoverageRatio(coverageTemp);
        result.setSelectedSeasonSufficientCoverage(coverageTemp >= 0.90 && coverageRain >= 0.90);

        if (coverageTemp >= 0.90) {
            result.setSelectedSeasonMeanTemp(sumTemp / validTempDays);
        }
        if (coverageRain >= 0.90) {
            result.setSelectedSeasonTotalRain(sumRain); // Accumulated total mm
        }

        // 2. Fetch Historical Baseline (1991-2019 Start Years -> 29 candidate seasons)
        List<Double> qualifyingBaselineTemps = new ArrayList<>();
        List<Double> qualifyingBaselineRains = new ArrayList<>();
        List<Integer> includedStartYears = new ArrayList<>();

        int totalCandidates = 29; // 1991 to 2019 inclusive
        result.setTotalCandidateBaselineSeasons(totalCandidates);

        for (int y = 1991; y <= 2019; y++) {
            String bStart = String.format("%d-%s", y, startMMDD);
            int bEndYear = (startMMDD.compareTo(endMMDD) > 0) ? y + 1 : y;
            String bEnd = String.format("%d-%s", bEndYear, endMMDD);

            List<DailyObservation> bObs = nasaPowerService.fetchDailyData(latitude, longitude, bStart, bEnd);
            int bValidT = 0;
            int bValidP = 0;
            double bSumT = 0.0;
            double bSumP = 0.0;

            for (DailyObservation obs : bObs) {
                if (obs.getT2m() != null) {
                    bValidT++;
                    bSumT += obs.getT2m();
                }
                if (obs.getPrectotcorr() != null) {
                    bValidP++;
                    bSumP += obs.getPrectotcorr();
                }
            }

            double bCovT = expectedDays > 0 ? (double) bValidT / expectedDays : 0.0;
            double bCovP = expectedDays > 0 ? (double) bValidP / expectedDays : 0.0;

            if (bCovT >= 0.90 && bCovP >= 0.90) {
                qualifyingBaselineTemps.add(bSumT / bValidT);
                qualifyingBaselineRains.add(bSumP);
                includedStartYears.add(y);
            }
        }

        result.setQualifyingBaselineSeasonsCount(includedStartYears.size());
        result.setIncludedBaselineStartYears(includedStartYears);
        result.setBaselineValid(includedStartYears.size() >= 24);

        // Calculate Anomalies if baseline is valid (>=24 seasons) and selected season coverage is sufficient (>=90%)
        if (result.isBaselineValid() && result.isSelectedSeasonSufficientCoverage()) {
            double baseMeanTemp = qualifyingBaselineTemps.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            double baseMeanRain = qualifyingBaselineRains.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

            result.setBaselineMeanTemp(baseMeanTemp);
            result.setBaselineMeanTotalRain(baseMeanRain);

            if (result.getSelectedSeasonMeanTemp() != null) {
                result.setTempAnomaly(result.getSelectedSeasonMeanTemp() - baseMeanTemp);
            }
            if (result.getSelectedSeasonTotalRain() != null) {
                result.setRainAnomaly(result.getSelectedSeasonTotalRain() - baseMeanRain);
            }
        }

        return result;
    }

    private int calculateExpectedDays(String startMMDD, String endMMDD) {
        // Approximate expected days for Nov 1 (11-01) to Apr 30 (04-30) excluding Feb 29 = 181 days
        if ("11-01".equals(startMMDD) && "04-30".equals(endMMDD)) {
            return 181;
        }
        if ("05-01".equals(startMMDD) && "09-30".equals(endMMDD)) {
            return 153;
        }
        if ("03-01".equals(startMMDD) && "06-30".equals(endMMDD)) {
            return 122;
        }
        return 180;
    }

    private String formatSeasonLabel(String startMMDD, String endMMDD, int year) {
        int endYear = (startMMDD.compareTo(endMMDD) > 0) ? year + 1 : year;
        return String.format("Season %d (%s %d - %s %d, Local Solar Time)", year, startMMDD, year, endMMDD, endYear);
    }
}
