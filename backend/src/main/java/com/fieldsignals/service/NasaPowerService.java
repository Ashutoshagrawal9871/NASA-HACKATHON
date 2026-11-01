package com.fieldsignals.service;

import com.fieldsignals.model.DailyObservation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@Service
public class NasaPowerService {
    private static final Logger logger = LoggerFactory.getLogger(NasaPowerService.class);
    private static final String POWER_API_URL = "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR&community=ag&longitude={lon}&latitude={lat}&start={start}&end={end}&format=JSON";
    
    private final RestTemplate restTemplate;

    public NasaPowerService() {
        this.restTemplate = new RestTemplate();
        // Set 5-second socket timeout
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        this.restTemplate.setRequestFactory(factory);
    }

    @Cacheable(value = "nasaPowerCache", key = "#latitude + '_' + #longitude + '_' + #startDate + '_' + #endDate")
    public List<DailyObservation> fetchDailyData(double latitude, double longitude, String startDate, String endDate) {
        logger.info("Fetching NASA POWER daily data for lat: {}, lon: {}, start: {}, end: {} (LST)", latitude, longitude, startDate, endDate);
        List<DailyObservation> observations = new ArrayList<>();
        
        try {
            Map<String, String> params = new HashMap<>();
            params.put("lat", String.valueOf(latitude));
            params.put("lon", String.valueOf(longitude));
            params.put("start", startDate.replace("-", ""));
            params.put("end", endDate.replace("-", ""));

            String responseStr = restTemplate.getForObject(POWER_API_URL, String.class, params);
            if (responseStr == null || responseStr.isBlank()) {
                logger.warn("Received empty response from NASA POWER API");
                return observations;
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseStr);
            JsonNode propertiesNode = root.path("properties");
            JsonNode parameterNode = propertiesNode.path("parameter");
            JsonNode t2mNode = parameterNode.path("T2M");
            JsonNode precNode = parameterNode.path("PRECTOTCORR");

            Iterator<String> dateKeys = t2mNode.fieldNames();
            Set<String> processedDates = new HashSet<>();

            while (dateKeys.hasNext()) {
                String dateStr = dateKeys.next(); // YYYYMMDD
                
                // Prevent duplicate date counting and exclude leap days (Feb 29)
                if (processedDates.contains(dateStr) || dateStr.endsWith("0229")) {
                    continue;
                }
                processedDates.add(dateStr);

                DailyObservation obs = new DailyObservation();
                obs.setDate(dateStr);

                // Parse T2M (Mean Temp at 2M °C) - Fill value -999 treated as null/missing
                if (t2mNode.has(dateStr)) {
                    double val = t2mNode.get(dateStr).asDouble();
                    if (val > -900.0) {
                        obs.setT2m(val);
                    }
                }

                // Parse PRECTOTCORR (Precipitation mm/day) - Fill value -999 treated as null/missing
                if (precNode.has(dateStr)) {
                    double val = precNode.get(dateStr).asDouble();
                    if (val > -900.0) {
                        obs.setPrectotcorr(val);
                    }
                }

                observations.add(obs);
            }
        } catch (Exception e) {
            logger.error("Error communicating with NASA POWER API: {}", e.getMessage());
            // Fail gracefully - return whatever observations were successfully parsed or empty list
        }

        return observations;
    }
}
