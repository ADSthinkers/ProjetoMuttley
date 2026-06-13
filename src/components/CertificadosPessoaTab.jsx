import { CalendarBlankIcon, DownloadSimpleIcon, FingerprintIcon, MedalIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const parseCertificadoDate = (value) => {
    if (!value) return null;

    if (Array.isArray(value)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = value;
        return new Date(year, month - 1, day, hour, minute, second);
    }

    const date = new Date(typeof value === "string" ? value.replace(" ", "T") : value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatarDataCertificado = (value) => {
    const date = parseCertificadoDate(value);
    return date ? date.toLocaleDateString("pt-BR") : "-";
};

const CertificadosPessoaTab = ({ certificados = [], api }) => {
    const handleDownload = async (certificado) => {
        try {
            const response = await api.get(`/certificados/${certificado.id}/pdf`, {
                responseType: "blob"
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `certificado-${certificado.codigoValidacao || certificado.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Erro ao baixar certificado:", err);
            toast.error("Não foi possível baixar o certificado.");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {certificados.length > 0 ? (
                <div className="overflow-hidden rounded-3xl border border-accent/10 bg-accent/5">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_0.8fr_1.1fr] gap-4 bg-accent/20 px-5 py-4 text-xs font-secondary font-bold uppercase text-primary/50">
                        <span>Atividade</span>
                        <span>Emissão</span>
                        <span>Carga</span>
                        <span>Ações</span>
                    </div>
                    <div className="divide-y divide-accent/10">
                        {certificados.map((certificado, index) => (
                            <div
                                key={certificado.id || certificado.codigoValidacao || index}
                                className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_0.8fr_1.1fr] gap-4 px-5 py-5 items-center"
                            >
                                <div className="min-w-0">
                                    <p className="text-lg font-primary font-bold text-primary truncate">{certificado.palestraTitulo || "Certificado"}</p>
                                    <div className="flex items-center gap-2 text-xs font-secondary text-primary/45 mt-1 min-w-0">
                                        <FingerprintIcon size={14} className="shrink-0" />
                                        <span className="truncate">{certificado.codigoValidacao || "Sem código"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-secondary text-primary/70">
                                    <CalendarBlankIcon size={18} />
                                    {formatarDataCertificado(certificado.dataEmissao)}
                                </div>
                                <span className="text-sm font-secondary font-semibold text-primary">
                                    {certificado.cargaHoraria ? `${certificado.cargaHoraria}h` : "-"}
                                </span>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(certificado)}
                                        className="btn btn-sm border-0 rounded-xl bg-accent text-primary font-secondary shadow-none"
                                    >
                                        <DownloadSimpleIcon size={16} />
                                        PDF
                                    </button>
                                    {certificado.codigoValidacao && (
                                        <Link
                                            to={`/certificado/validar/${certificado.codigoValidacao}`}
                                            className="btn btn-sm border-0 rounded-xl bg-accent/30 text-primary font-secondary shadow-none"
                                        >
                                            Validar
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-accent/5 border border-dashed border-accent/20 rounded-3xl p-10 text-center">
                    <MedalIcon size={42} className="mx-auto text-primary/25" />
                    <p className="text-primary/40 text-center mt-3 font-secondary">Nenhum certificado emitido para esta pessoa.</p>
                </div>
            )}
        </div>
    );
};

export default CertificadosPessoaTab;
