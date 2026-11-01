package com.fieldsignals.service;

import com.fieldsignals.model.AnomalyResult;
import com.fieldsignals.model.DailyObservation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

public class AnomalyCalculatorServiceTest {

    @Mock
    private NasaPowerService nasaPowerService;

    @InjectMocks
    private AnomalyCalculatorService anomalyCalculatorService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testSufficientCoverageAnomalyCalculation() {
        // Mock 181 distinct daily observations for selected season (100% coverage, 2023-11-01 to 2024-04-30)
        List<DailyObservation> selectedObs = new ArrayList<>();
        for (int i = 1; i <= 181; i++) {
            DailyObservation obs = new DailyObservation();
            obs.setDate(String.format("2023%04d", i)); // Distinct date strings
            obs.setT2m(22.0);
            obs.setPrectotcorr(2.0);
            selectedObs.add(obs);
        }

        // Mock 181 distinct observations for baseline seasons (20.0 °C temp, 1.5 mm rain)
        List<DailyObservation> baselineObs = new ArrayList<>();
        for (int i = 1; i <= 181; i++) {
            DailyObservation obs = new DailyObservation();
            obs.setDate(String.format("1991%04d", i));
            obs.setT2m(20.0);
            obs.setPrectotcorr(1.5);
            baselineObs.add(obs);
        }

        when(nasaPowerService.fetchDailyData(anyDouble(), anyDouble(), anyString(), anyString()))
                .thenReturn(selectedObs)
                .thenReturn(baselineObs);

        AnomalyResult result = anomalyCalculatorService.calculateSeasonalAnomaly(30.9, 75.8, "11-01", "04-30", 2023);

        assertNotNull(result);
        assertTrue(result.isSelectedSeasonSufficientCoverage());
        assertEquals(22.0, result.getSelectedSeasonMeanTemp(), 0.01);
        assertEquals(362.0, result.getSelectedSeasonTotalRain(), 0.1); // 181 * 2.0 mm
    }

    @Test
    public void testInsufficientCoverageSuppression() {
        // Mock season with missing observations (<90% coverage)
        List<DailyObservation> selectedObs = new ArrayList<>();
        for (int i = 1; i <= 50; i++) { // Only 50 out of 181 expected days
            DailyObservation obs = new DailyObservation();
            obs.setDate(String.format("2023%04d", i));
            obs.setT2m(25.0);
            obs.setPrectotcorr(1.0);
            selectedObs.add(obs);
        }

        when(nasaPowerService.fetchDailyData(anyDouble(), anyDouble(), anyString(), anyString()))
                .thenReturn(selectedObs);

        AnomalyResult result = anomalyCalculatorService.calculateSeasonalAnomaly(30.9, 75.8, "11-01", "04-30", 2023);

        assertNotNull(result);
        assertFalse(result.isSelectedSeasonSufficientCoverage());
        assertNull(result.getSelectedSeasonMeanTemp());
        assertNull(result.getSelectedSeasonTotalRain());
        assertNull(result.getTempAnomaly());
    }
}
