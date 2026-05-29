package com.fateczl.muttley.competencia;

public enum TipoCompetencia {
    SOFT_SKILL("Soft Skill"),
    HARD_SKILL("Hard Skill");

    private final String label;

    TipoCompetencia(String label) { this.label = label; }

    public String getLabel() { return label; }
}
