package com.fieldsignals.controller;

import com.fieldsignals.model.AnomalyResult;
import com.fieldsignals.service.AnomalyCalculatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    @Autowired
    private AnomalyCalculatorService anomalyCalculatorService;

    @GetMapping("/anomaly")
    public ResponseEntity<AnomalyResult> getSeasonalAnomaly(
            @RequestParam(defaultValue = "30.9") double latitude,
            @RequestParam(defaultValue = "75.8") double longitude,
            @RequestParam(defaultValue = "11-01") String startMMDD,
            @RequestParam(defaultValue = "04-30") String endMMDD,
            @RequestParam(defaultValue = "2023") int selectedYear) {

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return ResponseEntity.badRequest().build();
        }

        AnomalyResult result = anomalyCalculatorService.calculateSeasonalAnomaly(latitude, longitude, startMMDD, endMMDD, selectedYear);
        return ResponseEntity.ok(result);
    }
}
