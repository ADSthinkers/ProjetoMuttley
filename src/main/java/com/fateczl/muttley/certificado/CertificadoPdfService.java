package com.fateczl.muttley.certificado;

import com.fateczl.muttley.assinante.Assinante;
import com.fateczl.muttley.palestra.Palestra;
import com.fateczl.muttley.qrcode.QrCodeUtil;
import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfStamper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

// serviço responsável por gerar o PDF de um certificado com layout formatado e QR Code
@Service
public class CertificadoPdfService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String TEMPLATE = "certificados/certificado-base.pdf";
    private static final String ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf";
    private static final String ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";
    private static final Color TEXT = new Color(66, 66, 66);
    private static final Color RED = new Color(146, 4, 23);

    // gera o PDF do certificado usando o template visual oficial e dados dinâmicos por cima
    public byte[] gerar(Certificado certificado, String baseUrl) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfReader reader;
            try (InputStream template = new ClassPathResource(TEMPLATE).getInputStream()) {
                reader = new PdfReader(template);
            }
            PdfStamper stamper = new PdfStamper(reader, baos);
            PdfContentByte canvas = stamper.getOverContent(1);

            BaseFont arial = loadFont(ARIAL, BaseFont.HELVETICA);
            BaseFont arialBold = loadFont(ARIAL_BOLD, BaseFont.HELVETICA_BOLD);

            boolean isApresentacao = certificado.getTipo() == TipoCertificado.APRESENTACAO;
            Palestra palestra = certificado.getPalestra();
            String tituloDoc = isApresentacao ? "Certificado de Apresentação" : "Certificado de Participação";
            String tituloAtividade = palestra != null && palestra.getTitulo() != null
                    ? palestra.getTitulo().toUpperCase()
                    : "PALESTRA";

            drawCentered(canvas, tituloDoc, arialBold, 42, TEXT, 548, 471, 660);
            drawCentered(canvas, tituloAtividade, arial, 18, TEXT, 548, 438, 600);
            drawParagraph(canvas, textoCertificado(certificado, isApresentacao), arial, 11, TEXT,
                    255, 313, 830, 372, 13);
            drawAssinaturas(canvas, certificado, arial, arialBold);

            String validationUrl = baseUrl + "/certificado/validar/" + certificado.getCodigoValidacao();
            byte[] qrBytes = QrCodeUtil.gerar(validationUrl, 130, 130);
            Image qrImage = Image.getInstance(qrBytes);
            qrImage.scaleAbsolute(72, 72);
            qrImage.setAbsolutePosition(800, 95);
            canvas.addImage(qrImage);

            drawRight(canvas, "Verificação de Autenticidade", arial, 9, TEXT, 790, 150);
            drawRight(canvas, "Código de verificação: " + certificado.getCodigoValidacao(), arial, 8, TEXT, 790, 138);
            drawRight(canvas, "Emitido em " + dataEmissao(certificado), arial, 8, TEXT, 790, 126);
            drawRight(canvas, "Acesse o QRCODE para verificar a autenticação deste certificado", arial, 6, TEXT, 790, 113);

            stamper.close();
            reader.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do certificado", e);
        }
    }

    private String textoCertificado(Certificado certificado, boolean isApresentacao) {
        Palestra palestra = certificado.getPalestra();
        String nome = certificado.getNomeTitular().toUpperCase();
        String atividade = palestra != null && palestra.getTitulo() != null ? palestra.getTitulo() : "atividade";
        String data = palestra != null && palestra.getInicio() != null
                ? palestra.getInicio().toLocalDate().format(FMT)
                : dataEmissao(certificado);
        String ministrantes = palestra != null && palestra.getPalestrantes() != null && !palestra.getPalestrantes().isEmpty()
                ? palestra.getPalestrantes().stream().map(p -> p.getNome()).collect(Collectors.joining(", "))
                : "ministrante(s)";
        String competencias = palestra != null && palestra.getCompetencias() != null && !palestra.getCompetencias().isEmpty()
                ? palestra.getCompetencias().stream().map(c -> c.getNome()).collect(Collectors.joining(", "))
                : "competências relacionadas";
        String horas = horas(certificado);

        if (isApresentacao) {
            return "Certificamos que " + nome + " ministrou a atividade " + atividade
                    + ", realizada no dia " + data + ", com carga horária total de " + horas + ".";
        }

        return "Certificamos que " + nome + " participou da atividade " + atividade
                + ", realizada no dia " + data + " e ministrada por " + ministrantes
                + ", com carga horária total de " + horas
                + ", tendo desenvolvido com êxito as competências de " + competencias + ".";
    }

    private void drawAssinaturas(PdfContentByte canvas, Certificado certificado, BaseFont arial, BaseFont arialBold)
            throws Exception {
        List<Assinante> assinantes = certificado.getPalestra() != null
                && certificado.getPalestra().getEvento() != null
                ? certificado.getPalestra().getEvento().getAssinantes()
                : List.of();
        if (assinantes == null || assinantes.isEmpty()) {
            return;
        }

        float[][] posicoes = posicoesAssinaturas(Math.min(assinantes.size(), 3));
        for (int i = 0; i < posicoes.length; i++) {
            Assinante assinante = assinantes.get(i);
            float x = posicoes[i][0];
            drawCentered(canvas, assinante.getCargo().toUpperCase(), arial, 8, TEXT, x, 246, 120);
            drawImagemAssinatura(canvas, assinante, x);
            drawCentered(canvas, assinante.getNome().toUpperCase(), arial, 8, TEXT, x, 187, 135);
        }
    }

    private void drawImagemAssinatura(PdfContentByte canvas, Assinante assinante, float centerX) {
        try {
            if (assinante.getAssinatura() == null || assinante.getAssinatura().length == 0) {
                return;
            }
            Image img = Image.getInstance(assinante.getAssinatura());
            img.scaleToFit(125, 42);
            img.setAbsolutePosition(centerX - (img.getScaledWidth() / 2), 199);
            canvas.addImage(img);
        } catch (Exception ignored) {
            canvas.setColorStroke(RED);
            canvas.moveTo(centerX - 55, 211);
            canvas.lineTo(centerX + 55, 211);
            canvas.stroke();
        }
    }

    private float[][] posicoesAssinaturas(int total) {
        if (total == 1) return new float[][]{{555}};
        if (total == 2) return new float[][]{{465}, {645}};
        return new float[][]{{398}, {555}, {712}};
    }

    private void drawParagraph(PdfContentByte canvas, String text, BaseFont baseFont, float size, Color color,
                               float left, float bottom, float right, float top, float leading)
            throws DocumentException {
        ColumnText column = new ColumnText(canvas);
        column.setSimpleColumn(new Phrase(text, new Font(baseFont, size, Font.NORMAL, color)),
                left, bottom, right, top, leading, Element.ALIGN_CENTER);
        column.go();
    }

    private void drawCentered(PdfContentByte canvas, String text, BaseFont font, float size, Color color,
                              float x, float y, float maxWidth) {
        float fitted = fit(font, text, size, maxWidth, 8);
        canvas.beginText();
        canvas.setColorFill(color);
        canvas.setFontAndSize(font, fitted);
        canvas.showTextAligned(Element.ALIGN_CENTER, text, x, y, 0);
        canvas.endText();
    }

    private void drawRight(PdfContentByte canvas, String text, BaseFont font, float size, Color color, float x, float y) {
        canvas.beginText();
        canvas.setColorFill(color);
        canvas.setFontAndSize(font, size);
        canvas.showTextAligned(Element.ALIGN_RIGHT, text, x, y, 0);
        canvas.endText();
    }

    private float fit(BaseFont font, String text, float size, float maxWidth, float minSize) {
        float current = size;
        while (font.getWidthPoint(text, current) > maxWidth && current > minSize) {
            current -= 1f;
        }
        return current;
    }

    private BaseFont loadFont(String path, String fallback) throws Exception {
        try {
            return BaseFont.createFont(path, BaseFont.CP1252, BaseFont.EMBEDDED);
        } catch (Exception ignored) {
            return BaseFont.createFont(fallback, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
        }
    }

    private String horas(Certificado certificado) {
        float ch = certificado.getCargaHoraria() != null ? certificado.getCargaHoraria()
                : certificado.getPalestra() != null && certificado.getPalestra().getCargaHoraria() != null
                        ? certificado.getPalestra().getCargaHoraria()
                        : 1f;
        return String.format(java.util.Locale.US, "%.0f hora(s)", ch);
    }

    private String dataEmissao(Certificado certificado) {
        LocalDate data = certificado.getDataEmissao() != null
                ? certificado.getDataEmissao().toLocalDate()
                : LocalDate.now();
        return data.format(FMT);
    }
}
