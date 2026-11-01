package com.fieldsignals.service;

import com.fieldsignals.model.VaranasiSequenceResult;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class VaranasiRotationServiceTest {

    @Test
    public void testGetVerifiedVaranasiSequences() {
        VaranasiRotationService service = new VaranasiRotationService();
        List<VaranasiSequenceResult> sequences = service.getVerifiedVaranasiSequences();

        assertNotNull(sequences);
        assertEquals(4, sequences.size());

        // Verify Treatment T7 (Highest SRGEY)
        VaranasiSequenceResult t7 = sequences.stream().filter(s -> "T7".equals(s.getTreatmentId())).findFirst().orElse(null);
        assertNotNull(t7);
        assertEquals(28.88, t7.getSrgeyValueTonnesPerHa(), 0.01);
        assertEquals("Table 1, p. 718", t7.getExactTablePageRef());
        assertNull(t7.getSoilOrganicCarbonPercent());

        // Verify Treatment T10 (2nd Highest SRGEY)
        VaranasiSequenceResult t10 = sequences.stream().filter(s -> "T10".equals(s.getTreatmentId())).findFirst().orElse(null);
        assertNotNull(t10);
        assertEquals(25.67, t10.getSrgeyValueTonnesPerHa(), 0.01);

        // Verify Treatment T3 (SOC Soil Health Result & Table 1 SRGEY)
        VaranasiSequenceResult t3 = sequences.stream().filter(s -> "T3".equals(s.getTreatmentId())).findFirst().orElse(null);
        assertNotNull(t3);
        assertEquals(13.73, t3.getSrgeyValueTonnesPerHa(), 0.01); // Table 1, p. 718
        assertEquals(0.50, t3.getSoilOrganicCarbonPercent(), 0.01);  // Table 2, p. 719

        // Verify Treatment T1 (Control)
        VaranasiSequenceResult t1 = sequences.stream().filter(s -> "T1".equals(s.getTreatmentId())).findFirst().orElse(null);
        assertNotNull(t1);
        assertEquals(12.09, t1.getSrgeyValueTonnesPerHa(), 0.01); // Table 1, p. 718
        assertEquals(0.44, t1.getSoilOrganicCarbonPercent(), 0.01);  // Table 2, p. 719
    }
}
