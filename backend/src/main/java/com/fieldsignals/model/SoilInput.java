package com.fieldsignals.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class SoilInput {
    @Min(value = 0, message = "pH must be between 0 and 14")
    @Max(value = 14, message = "pH must be between 0 and 14")
    private double ph;

    @Min(value = 0, message = "SOC percentage cannot be negative")
    @Max(value = 100, message = "SOC percentage cannot exceed 100%")
    private Double socPercent; // Soil Organic Carbon % (optional)

    private String textureClass; // Loam, Sandy Loam, Clay Loam, Clay, Silt Loam
    private String testingLaboratory; // Name of lab issuing report
    private String sampleDate; // YYYY-MM-DD
    private String analyticalMethod; // e.g., Walkley-Black Method
    private boolean userConfirmedLocalTest;

    public SoilInput() {
        this.ph = 7.0;
        this.socPercent = 0.45;
        this.textureClass = "Loam";
        this.testingLaboratory = "Regional Soil Testing Lab";
        this.sampleDate = "2024-01-15";
        this.analyticalMethod = "Walkley-Black Method";
        this.userConfirmedLocalTest = true;
    }

    public SoilInput(double ph, Double socPercent, String textureClass, String testingLaboratory, String sampleDate, String analyticalMethod, boolean userConfirmedLocalTest) {
        this.ph = ph;
        this.socPercent = socPercent;
        this.textureClass = textureClass;
        this.testingLaboratory = testingLaboratory;
        this.sampleDate = sampleDate;
        this.analyticalMethod = analyticalMethod;
        this.userConfirmedLocalTest = userConfirmedLocalTest;
    }

    public double getPh() { return ph; }
    public void setPh(double ph) { this.ph = ph; }

    public Double getSocPercent() { return socPercent; }
    public void setSocPercent(Double socPercent) { this.socPercent = socPercent; }

    public String getTextureClass() { return textureClass; }
    public void setTextureClass(String textureClass) { this.textureClass = textureClass; }

    public String getTestingLaboratory() { return testingLaboratory; }
    public void setTestingLaboratory(String testingLaboratory) { this.testingLaboratory = testingLaboratory; }

    public String getSampleDate() { return sampleDate; }
    public void setSampleDate(String sampleDate) { this.sampleDate = sampleDate; }

    public String getAnalyticalMethod() { return analyticalMethod; }
    public void setAnalyticalMethod(String analyticalMethod) { this.analyticalMethod = analyticalMethod; }

    public boolean isUserConfirmedLocalTest() { return userConfirmedLocalTest; }
    public void setUserConfirmedLocalTest(boolean userConfirmedLocalTest) { this.userConfirmedLocalTest = userConfirmedLocalTest; }
}
