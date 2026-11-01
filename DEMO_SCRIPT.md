# FieldSignals: 2-Minute Presentation Demo Script

**Theme:** NASA Space Apps Challenge 2026 — "Field Shift: Adapting Farms with NASA Data"  
**Tone:** Scientifically rigorous, transparent, zero hallucination.

---

### [0:00 - 0:25] The Problem & The Scientific Safeguard
> *"Judges, farmers worldwide are dealing with shifting temperatures, erratic rainfall, and declining soil health. But existing digital tools often overpromise: they take coarse climate grids and hallucinate farm-level planting advice.*  
> *With **FieldSignals**, we built a decision-support platform designed around scientific honesty and traceable evidence. We do not use generative AI to guess recommendations. Every number on this screen is either calculated from open NASA Earth Observations, provided by local lab records, or cited directly from peer-reviewed agricultural field trials."*

---

### [0:25 - 0:55] Global Map, NASA Baseline & Scientific Safeguards
*(Click the **"🌾 Punjab Preset"** button)*
> *"Anyone can select coordinates globally. When we look at Punjab for the Rabi growing season (Nov 1 to Apr 30), FieldSignals displays the selected coordinate point and documents the $0.5^\circ \times 0.625^\circ$ MERRA-2 reanalysis area represented by NASA POWER. We can also toggle the NASA GIBS MODIS NDVI layer for a 250-meter visual vegetation backdrop.*  
> *Below the map, our backend queries live NASA POWER daily data in Local Solar Time, comparing against our computed 1991–2019 baseline across 29 candidate years. Notice our completeness badges: temperature and precipitation are tracked independently. If data completeness falls below 90% or if upstream services fail, anomalies are suppressed rather than guessed. We distinguish upstream network failures from low coverage—never inventing numbers."*

---

### [0:50 - 1:20] Soil Provenance & Farmer Priorities
*(Scroll to the **Soil Form** and click **"Load Synthetic Demo Sample"**)*
> *"NASA satellites do not measure farm-level soil chemistry. So we provide a dedicated soil test input form where farmers enter their actual lab test results—like pH and Soil Organic Carbon. Notice our prominent provenance badge: we clearly inform users that this data is user-provided, not satellite data.*  
> *Next, farmers set their own priorities—such as System Productivity or Soil Health. Rather than inventing an arbitrary suitability score, these priorities highlight verified outcomes from our cited research showcase."*

---

### [1:20 - 1:45] Sourced Crop Rotation Showcase (Saha et al., 2012)
*(Scroll to the **Varanasi Case Study Explorer**)*
> *"Crop rotation is central to adapting farms. Here we showcase an actual 3-year randomized field trial from BHU Agricultural Research Farm in Varanasi, published in the Indian Journal of Agricultural Sciences.*  
> *We cite exact tables and pages: Treatment T7 (Basmati rice – potato – blackgram) achieved the highest System Rice Grain Equivalent Yield of 28.88 t/ha/year (Table 1, p. 718). Treatment T3 incorporated sesbania green manure and was associated with Soil Organic Carbon of 0.50%, compared to 0.44% in the rice-wheat control (Table 2, p. 719). We show this as historical research context—never a generic prescription."*

---

### [1:45 - 2:00] Deterministic Summary & Conclusion
*(Scroll to the **Farmer Summary** and click **"Methodology & Citations"** in the header)*
> *"Finally, our summary is 100% deterministic—generated from calculated values without any AI. We include a full Methodology Modal with data source limitations and disclaimers.*  
> *FieldSignals bridges space data and on-the-ground agronomy with complete scientific integrity. Thank you."*
