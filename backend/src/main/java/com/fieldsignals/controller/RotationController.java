package com.fieldsignals.controller;

import com.fieldsignals.model.VaranasiSequenceResult;
import com.fieldsignals.service.VaranasiRotationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rotation")
@CrossOrigin(origins = "*")
public class RotationController {

    @Autowired
    private VaranasiRotationService varanasiRotationService;

    @GetMapping("/varanasi")
    public ResponseEntity<List<VaranasiSequenceResult>> getVaranasiShowcase() {
        List<VaranasiSequenceResult> sequences = varanasiRotationService.getVerifiedVaranasiSequences();
        return ResponseEntity.ok(sequences);
    }
}
