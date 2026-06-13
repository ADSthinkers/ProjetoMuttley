const STORAGE_KEY = "muttley_activity_status";

const readStoredStatuses = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
        return {};
    }
};

const writeStoredStatuses = (statuses) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
};

export const getStoredActivityStatus = (type, id) => {
    if (!type || !id) return "";
    return readStoredStatuses()?.[type]?.[String(id)] || "";
};

export const setStoredActivityStatus = (type, id, status) => {
    if (!type || !id || !status) return;
    const statuses = readStoredStatuses();
    statuses[type] = { ...(statuses[type] || {}), [String(id)]: status };
    writeStoredStatuses(statuses);
};

export const getActivityStatus = (item, type) => (
    item && Object.prototype.hasOwnProperty.call(item, "statusOperacional")
        ? (item.statusOperacional || "")
        : (
            item?.statusEvento ||
            item?.situacao ||
            (type ? getStoredActivityStatus(type, item?.id) : "") ||
            ""
        )
);

export const isCanceled = (item, type) => getActivityStatus(item, type) === "CANCELADO";
export const isFinalized = (item, type) => getActivityStatus(item, type) === "FINALIZADO";
export const isArchived = (item, type) => getActivityStatus(item, type) === "ARQUIVADO";
export const isInactive = (item, type) => isCanceled(item, type) || isArchived(item, type);
export const blocksNewPalestras = (item, type = "evento") => {
    const status = getActivityStatus(item, type);
    return status === "CANCELADO" || status === "FINALIZADO" || status === "ARQUIVADO";
};

export const getOperationalStatusLabel = (status) => {
    if (status === "CANCELADO") return "Cancelado";
    if (status === "FINALIZADO") return "Finalizado";
    if (status === "ARQUIVADO") return "Arquivado";
    return "";
};

export const getOperationalStatusBadgeClass = (status) => {
    if (status === "CANCELADO") return "bg-error/20 text-error";
    if (status === "FINALIZADO") return "bg-accent/40 text-primary";
    if (status === "ARQUIVADO") return "bg-primary/10 text-primary/70";
    return "";
};
