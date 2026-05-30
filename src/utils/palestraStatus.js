export const PALESTRA_STATUS = [
    { value: "PENDENTE", label: "Pendente" },
    { value: "CONCLUIDA", label: "Concluída" },
    { value: "CERTIFICADOS_EMITIDOS", label: "Certificados emitidos" },
];

export const getPalestraStatusLabel = (status) => (
    PALESTRA_STATUS.find((item) => item.value === status)?.label || "Pendente"
);

export const getPalestraStatusBadgeClass = (status) => {
    if (status === "CONCLUIDA") return "bg-right/20 text-primary";
    if (status === "CERTIFICADOS_EMITIDOS") return "bg-accent text-primary";
    return "bg-warning/20 text-primary";
};
