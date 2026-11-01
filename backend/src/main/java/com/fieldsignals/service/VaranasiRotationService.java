package com.fieldsignals.service;

import com.fieldsignals.model.VaranasiSequenceResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class VaranasiRotationService {

    public List<VaranasiSequenceResult> getVerifiedVaranasiSequences() {
        List<VaranasiSequenceResult> sequences = new ArrayList<>();

        String citation = "Saha et al. (2012), Indian Journal of Agricultural Sciences 82(8):717–720. DOI: 10.56093/ijas.v82i8.23061";
        String siteContext = "BHU Agricultural Research Farm, Varanasi (2006–07 to 2008–09), Irrigated rice-wheat system, Randomized block design (3 replications). Historical research showcase — not a prediction for user farm.";

        // Treatment T7 (Highest System Rice Grain Equivalent Yield - SRGEY)
        VaranasiSequenceResult t7 = new VaranasiSequenceResult(
                "T7",
                "Basmati rice – potato – blackgram",
                List.of("Basmati rice (Oryza sativa)", "Potato (Solanum tuberosum)", "Blackgram (Vigna mungo)"),
                "Cash crop diversification with legume pulse break",
                "System Rice Grain Equivalent Yield (SRGEY)",
                28.88, // Table 1, p. 718
                null,  // SOC not reported separately for T7 in Table 2
                "Integrated Nutrient Management (INM)",
                citation,
                "Table 1, p. 718",
                siteContext
        );
        sequences.add(t7);

        // Treatment T10 (2nd Highest SRGEY)
        VaranasiSequenceResult t10 = new VaranasiSequenceResult(
                "T10",
                "Basmati rice – maize (cob) + vegetable pea (1:2) – greengram",
                List.of("Basmati rice (Oryza sativa)", "Maize (cob) (Zea mays)", "Vegetable pea (1:2 intercrop) (Pisum sativum)", "Greengram (Vigna radiata)"),
                "Intercropped vegetable legume & pulse break",
                "System Rice Grain Equivalent Yield (SRGEY)",
                25.67, // Table 1, p. 718
                null,  // SOC not reported separately for T10 in Table 2
                "Integrated Nutrient Management (INM)",
                citation,
                "Table 1, p. 718",
                siteContext
        );
        sequences.add(t10);

        // Treatment T3 (Soil Organic Carbon Improvement)
        VaranasiSequenceResult t3 = new VaranasiSequenceResult(
                "T3",
                "Early rice – rapeseed – maize (cob) – sesbania (green manure)",
                List.of("Early rice (Oryza sativa)", "Rapeseed (Brassica napus)", "Maize (cob) (Zea mays)", "Sesbania (green manure) (Sesbania bispinosa)"),
                "Green manure organic incorporation & oilseed diversification",
                "System Rice Grain Equivalent Yield (SRGEY)",
                13.73, // Table 1, p. 718 (exact verified value)
                0.50,  // Soil Organic Carbon % (vs 0.44% in T1 control, Table 2, p. 719)
                "Integrated Nutrient Management (INM)",
                citation,
                "Table 1, p. 718 & Table 2, p. 719",
                siteContext
        );
        sequences.add(t3);

        // Treatment T1 (Regional Control - Rice-Wheat)
        VaranasiSequenceResult t1 = new VaranasiSequenceResult(
                "T1",
                "Rice – wheat (Regional Standard Control)",
                List.of("Rice (Oryza sativa)", "Wheat (Triticum aestivum)"),
                "Standard conventional rice-wheat rotation",
                "System Rice Grain Equivalent Yield (SRGEY)",
                12.09, // Table 1, p. 718 (exact verified value)
                0.44,  // Soil Organic Carbon % (Table 2, p. 719)
                "Conventional Fertilizer Application",
                citation,
                "Table 1, p. 718 & Table 2, p. 719",
                siteContext
        );
        sequences.add(t1);

        return sequences;
    }
}
