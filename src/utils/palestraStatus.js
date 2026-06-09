export const PALESTRA_STATUS = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "CONCLUIDA", label: "Concluída" },
    { value: "CERTIFICADOS_EMITIDOS", label: "Certificados emitidos" },
];

export const getPalestraStatusLabel = (status) => (
    status === "CANCELADO" ? "Cancelada" :
    status === "ARQUIVADO" ? "Arquivada" :
    PALESTRA_STATUS.find((item) => item.value === status)?.label || "Pendente"
);

export const getPalestraStatusBadgeClass = (status) => {
    if (status === "CONCLUIDA") return "bg-right/20 text-primary";
    if (status === "CERTIFICADOS_EMITIDOS") return "bg-accent text-primary";
    if (status === "CANCELADO") return "bg-error/20 text-error";
    if (status === "ARQUIVADO") return "bg-primary/10 text-primary/70";
    return "bg-warning/20 text-primary";
};
