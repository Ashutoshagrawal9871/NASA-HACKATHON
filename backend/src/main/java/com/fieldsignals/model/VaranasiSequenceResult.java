package com.fieldsignals.model;

import java.util.List;

public class VaranasiSequenceResult {
    private String treatmentId; // e.g. "T7", "T10", "T3", "T1"
    private String sequenceName; // e.g. "Basmati rice – potato – blackgram"
    private List<String> cropsInSequence;
    private String roleInSequence; // e.g., "Cash crop diversification with legume pulse break"
    private String yieldMetricName; // "System Rice Grain Equivalent Yield (SRGEY)"
    private Double srgeyValueTonnesPerHa; // e.g. 28.88 t/ha/year
    private Double soilOrganicCarbonPercent; // e.g. 0.50% (for T3) or 0.44% (for T1)
    private String nutrientManagementTreatment; // e.g. "Integrated Nutrient Management (INM)"
    private String exactSourceCitation; // "Saha et al. (2012), Indian J. Agric. Sci. 82(8):717–720"
    private String exactTablePageRef; // "Table 1, p. 718" or "Table 2, p. 719"
    private String studyContextNote; // "BHU Research Farm, Varanasi (2006–09), Irrigated rice-wheat system. Not a prediction for user farm."

    public VaranasiSequenceResult() {}

    public VaranasiSequenceResult(String treatmentId, String sequenceName, List<String> cropsInSequence, String roleInSequence, String yieldMetricName, Double srgeyValueTonnesPerHa, Double soilOrganicCarbonPercent, String nutrientManagementTreatment, String exactSourceCitation, String exactTablePageRef, String studyContextNote) {
        this.treatmentId = treatmentId;
        this.sequenceName = sequenceName;
        this.cropsInSequence = cropsInSequence;
        this.roleInSequence = roleInSequence;
        this.yieldMetricName = yieldMetricName;
        this.srgeyValueTonnesPerHa = srgeyValueTonnesPerHa;
        this.soilOrganicCarbonPercent = soilOrganicCarbonPercent;
        this.nutrientManagementTreatment = nutrientManagementTreatment;
        this.exactSourceCitation = exactSourceCitation;
        this.exactTablePageRef = exactTablePageRef;
        this.studyContextNote = studyContextNote;
    }

    public String getTreatmentId() { return treatmentId; }
    public void setTreatmentId(String treatmentId) { this.treatmentId = treatmentId; }

    public String getSequenceName() { return sequenceName; }
    public void setSequenceName(String sequenceName) { this.sequenceName = sequenceName; }

    public List<String> getCropsInSequence() { return cropsInSequence; }
    public void setCropsInSequence(List<String> cropsInSequence) { this.cropsInSequence = cropsInSequence; }

    public String getRoleInSequence() { return roleInSequence; }
    public void setRoleInSequence(String roleInSequence) { this.roleInSequence = roleInSequence; }

    public String getYieldMetricName() { return yieldMetricName; }
    public void setYieldMetricName(String yieldMetricName) { this.yieldMetricName = yieldMetricName; }

    public Double getSrgeyValueTonnesPerHa() { return srgeyValueTonnesPerHa; }
    public void setSrgeyValueTonnesPerHa(Double srgeyValueTonnesPerHa) { this.srgeyValueTonnesPerHa = srgeyValueTonnesPerHa; }

    public Double getSoilOrganicCarbonPercent() { return soilOrganicCarbonPercent; }
    public void setSoilOrganicCarbonPercent(Double soilOrganicCarbonPercent) { this.soilOrganicCarbonPercent = soilOrganicCarbonPercent; }

    public String getNutrientManagementTreatment() { return nutrientManagementTreatment; }
    public void setNutrientManagementTreatment(String nutrientManagementTreatment) { this.nutrientManagementTreatment = nutrientManagementTreatment; }

    public String getExactSourceCitation() { return exactSourceCitation; }
    public void setExactSourceCitation(String exactSourceCitation) { this.exactSourceCitation = exactSourceCitation; }

    public String getExactTablePageRef() { return exactTablePageRef; }
    public void setExactTablePageRef(String exactTablePageRef) { this.exactTablePageRef = exactTablePageRef; }

    public String getStudyContextNote() { return studyContextNote; }
    public void setStudyContextNote(String studyContextNote) { this.studyContextNote = studyContextNote; }
}
