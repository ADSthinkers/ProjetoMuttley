package com.fateczl.muttley.certificado;

import com.fateczl.muttley.qrcode.QrCodeUtil;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

// serviço responsável por gerar o PDF de um certificado com layout formatado e QR Code
@Service
public class CertificadoPdfService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // gera o conteúdo binário do PDF do certificado incluindo dados da palestra e QR Code de validação
    public byte[] gerar(Certificado certificado, String baseUrl) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 70, 70, 80, 80);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Font instFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(0, 86, 179));
            Font titleFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 17);
            Font subFont    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font bodyFont   = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Font labelFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font smallFont  = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(120, 120, 120));

            // --- Cabeçalho ---
            Paragraph inst = new Paragraph("FATEC ZONA LESTE", instFont);
            inst.setAlignment(Element.ALIGN_CENTER);
            doc.add(inst);

            Paragraph sub = new Paragraph("Faculdade de Tecnologia de São Paulo – Zona Leste", bodyFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(6);
            doc.add(sub);

            addDivider(doc);

            // --- Título ---
            boolean isApresentacao = certificado.getTipo() == TipoCertificado.APRESENTACAO;
            String tituloDoc = isApresentacao ? "CERTIFICADO DE APRESENTAÇÃO" : "CERTIFICADO DE PARTICIPAÇÃO";
            Paragraph title = new Paragraph(tituloDoc, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(20);
            title.setSpacingAfter(24);
            doc.add(title);

            // --- Corpo ---
            String nomePart = certificado.getNomeTitular().toUpperCase();
            String tituloPalestra = certificado.getPalestra() != null
                    ? certificado.getPalestra().getTitulo() : "PALESTRA";
            String verbo = isApresentacao ? " ministrou a seguinte atividade:" : " participou da seguinte atividade:";

            Paragraph corpo = new Paragraph();
            corpo.setAlignment(Element.ALIGN_CENTER);
            corpo.add(new Chunk("Certificamos que ", bodyFont));
            corpo.add(new Chunk(nomePart, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13)));
            corpo.add(new Chunk(verbo, bodyFont));
            corpo.setSpacingAfter(10);
            doc.add(corpo);

            Paragraph palestraTitulo = new Paragraph(tituloPalestra, subFont);
            palestraTitulo.setAlignment(Element.ALIGN_CENTER);
            palestraTitulo.setSpacingAfter(20);
            doc.add(palestraTitulo);

            // --- Detalhes ---
            if (certificado.getPalestra() != null) {
                var palestra = certificado.getPalestra();

                if (palestra.getPalestrantes() != null && !palestra.getPalestrantes().isEmpty()) {
                    String nomes = palestra.getPalestrantes().stream()
                            .map(p -> p.getNome()).collect(Collectors.joining(", "));
                    addDetalhe(doc, "Ministrante(s):", nomes, labelFont, bodyFont);
                }

                float ch = certificado.getCargaHoraria() != null ? certificado.getCargaHoraria()
                        : (palestra.getCargaHoraria() != null ? palestra.getCargaHoraria() : 1f);
                addDetalhe(doc, "Carga Horária:", String.format("%.0f hora(s)", ch), labelFont, bodyFont);

                if (palestra.getCompetencias() != null && !palestra.getCompetencias().isEmpty()) {
                    String comps = palestra.getCompetencias().stream()
                            .map(c -> c.getNome()).collect(Collectors.joining(", "));
                    addDetalhe(doc, "Competências desenvolvidas:", comps, labelFont, bodyFont);
                }

                if (palestra.getInicio() != null) {
                    addDetalhe(doc, "Data da atividade:", palestra.getInicio().format(FMT), labelFont, bodyFont);
                }
            }

            if (certificado.getDataEmissao() != null) {
                addDetalhe(doc, "Data de emissão:", certificado.getDataEmissao().format(FMT), labelFont, bodyFont);
            }

            addDivider(doc);

            // --- QR Code ---
            String validationUrl = baseUrl + "/certificado/validar/" + certificado.getCodigoValidacao();
            byte[] qrBytes = QrCodeUtil.gerar(validationUrl, 130, 130);
            Image qrImage = Image.getInstance(qrBytes);
            qrImage.setAlignment(Element.ALIGN_CENTER);
            qrImage.setSpacingBefore(14);
            doc.add(qrImage);

            Paragraph codeLabel = new Paragraph("Código de validação", smallFont);
            codeLabel.setAlignment(Element.ALIGN_CENTER);
            codeLabel.setSpacingBefore(6);
            doc.add(codeLabel);

            Paragraph code = new Paragraph(certificado.getCodigoValidacao(),
                    FontFactory.getFont(FontFactory.COURIER, 9, new Color(0, 86, 179)));
            code.setAlignment(Element.ALIGN_CENTER);
            doc.add(code);

            Paragraph urlLine = new Paragraph(validationUrl, smallFont);
            urlLine.setAlignment(Element.ALIGN_CENTER);
            urlLine.setSpacingBefore(4);
            doc.add(urlLine);

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do certificado", e);
        }
    }

    // adiciona uma linha de detalhe centralizada com rótulo em negrito e valor ao documento PDF
    private void addDetalhe(Document doc, String label, String value, Font labelFont, Font bodyFont)
            throws DocumentException {
        Paragraph p = new Paragraph();
        p.setAlignment(Element.ALIGN_CENTER);
        p.add(new Chunk(label + " ", labelFont));
        p.add(new Chunk(value, bodyFont));
        p.setSpacingAfter(6);
        doc.add(p);
    }

    // insere uma linha divisória decorativa no documento PDF
    private void addDivider(Document doc) throws DocumentException {
        Paragraph div = new Paragraph(
                "─────────────────────────────────────────────────────────",
                FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(200, 200, 200)));
        div.setAlignment(Element.ALIGN_CENTER);
        div.setSpacingBefore(4);
        div.setSpacingAfter(4);
        doc.add(div);
    }
}
