package com.fateczl.muttley.email;

import com.fateczl.muttley.certificado.Certificado;
import com.fateczl.muttley.certificado.TipoCertificado;
import com.fateczl.muttley.competencia.Competencia;
import com.fateczl.muttley.participante.Participante;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCertificado(Certificado cert, byte[] pdfBytes) {
        String email = cert.getEmailTitular();
        if (email == null || email.isBlank()) return;

        try {
            String validationUrl = frontendUrl + "/certificado/validar/" + cert.getCodigoValidacao();
            String downloadUrl = baseUrl + "/certificado/validar/" + cert.getCodigoValidacao() + "/pdf";
            String linkedinUrl = buildLinkedInUrl(cert, validationUrl);
            boolean isApresentacao = cert.getTipo() == TipoCertificado.APRESENTACAO;
            String tipoCert = isApresentacao ? "Apresentação" : "Participação";
            String nomePalestra = cert.getPalestra() != null ? cert.getPalestra().getTitulo() : "Atividade";
            String orgName = resolverOrganizacao(cert);
            String competenciasHtml = buildCompetenciasHtml(cert);

            String assunto = "Seu Certificado: " + nomePalestra;
            String corpo = buildHtmlEmail(cert.getNomeTitular(), nomePalestra, tipoCert,
                    validationUrl, downloadUrl, linkedinUrl, cert.getCodigoValidacao(), orgName, competenciasHtml);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject(assunto);
            helper.setText(corpo, true);
            helper.addAttachment("certificado.pdf", () -> new java.io.ByteArrayInputStream(pdfBytes));

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Falha ao enviar e-mail para " + email + ": " + e.getMessage());
        }
    }

    public void enviarEvolucaoCompetencia(Participante participante, Competencia competencia, float horas, int nivel) {
        if (participante == null || participante.getEmail() == null || participante.getEmail().isBlank()) return;

        try {
            String nomeParticipante = participante.getNome() != null ? participante.getNome() : "Participante";
            String nomeCompetencia = competencia != null && competencia.getNome() != null
                    ? competencia.getNome()
                    : "Competência";
            String linkedinUrl = buildLinkedInSkillUrl(nomeCompetencia);
            String assunto = "Você evoluiu em " + nomeCompetencia;
            String corpo = buildHtmlEvolucaoCompetencia(nomeParticipante, nomeCompetencia, horas, nivel, linkedinUrl);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(participante.getEmail());
            helper.setSubject(assunto);
            helper.setText(corpo, true);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Falha ao enviar e-mail de evolução de competência para "
                    + participante.getEmail() + ": " + e.getMessage());
        }
    }

    public String buildLinkedInUrl(Certificado cert, String validationUrl) {
        String nomePalestra = cert.getPalestra() != null ? cert.getPalestra().getTitulo() : "";
        String orgName = resolverOrganizacao(cert);
        String issueYear = cert.getDataEmissao() != null
                ? String.valueOf(cert.getDataEmissao().getYear()) : "";
        String issueMonth = cert.getDataEmissao() != null
                ? String.format("%02d", cert.getDataEmissao().getMonthValue()) : "";

        return "https://www.linkedin.com/profile/add/" +
                "?startTask=CERTIFICATION_NAME" +
                "&name=" + encode(nomePalestra) +
                "&organizationName=" + encode(orgName) +
                "&issueYear=" + issueYear +
                "&issueMonth=" + issueMonth +
                "&certId=" + encode(cert.getCodigoValidacao()) +
                "&certUrl=" + encode(validationUrl);
    }

    private String buildLinkedInSkillUrl(String nomeCompetencia) {
        return "https://www.linkedin.com/profile/add/" +
                "?startTask=SCHOOL_SKILL" +
                "&name=" + encode(nomeCompetencia);
    }

    private String resolverOrganizacao(Certificado cert) {
        if (cert.getPalestra() != null && cert.getPalestra().getPatrocinador() != null) {
            return cert.getPalestra().getPatrocinador().getNomeExibicao();
        }
        return "FATEC Zona Leste";
    }

    private String encode(String value) {
        if (value == null) return "";
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String buildCompetenciasHtml(Certificado cert) {
        if (cert.getPalestra() == null || cert.getPalestra().getCompetencias() == null
                || cert.getPalestra().getCompetencias().isEmpty()) {
            return """
                    <p style="margin: 8px 0 0 0; color: rgba(19, 17, 0, 0.55); font-size: 14px; line-height: 1.5;">
                        Nenhuma competência vinculada a este certificado.
                    </p>
                    """;
        }

        List<String> competencias = cert.getPalestra().getCompetencias().stream()
                .map(Competencia::getNome)
                .filter(nome -> nome != null && !nome.isBlank())
                .distinct()
                .toList();

        if (competencias.isEmpty()) {
            return """
                    <p style="margin: 8px 0 0 0; color: rgba(19, 17, 0, 0.55); font-size: 14px; line-height: 1.5;">
                        Nenhuma competência vinculada a este certificado.
                    </p>
                    """;
        }

        StringBuilder html = new StringBuilder();
        for (String competencia : competencias) {
            html.append("""
                    <span style="display: inline-block; margin: 6px 6px 0 0; padding: 8px 12px; border-radius: 999px; background-color: rgba(252, 209, 96, 0.22); color: #131100; font-size: 13px; font-weight: 700;">
                        %s
                    </span>
                    """.formatted(escapeHtml(competencia)));
        }
        return html.toString();
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String buildHtmlEmail(String nome, String palestra, String tipo,
                                   String validationUrl, String downloadUrl, String linkedinUrl,
                                   String codigo, String organizacao, String competenciasHtml) {
        return """
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #FEFDF6; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(19, 17, 0, 0.05); border: 1px solid rgba(19, 17, 0, 0.05);">
                                    <!-- Header -->
                                    <tr>
                                        <td align="center" style="padding: 40px 40px 20px 40px;">
                                            <div style="background-color: #FCD160; width: 60px; height: 60px; border-radius: 16px; display: inline-block; line-height: 60px; text-align: center; margin-bottom: 20px;">
                                                <span style="font-size: 32px; font-weight: bold; color: #131100;">M</span>
                                            </div>
                                            <h1 style="margin: 0; color: #131100; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Seu Certificado Chegou!</h1>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 0 40px 40px 40px;">
                                            <p style="margin: 0 0 20px 0; color: #131100; font-size: 18px; line-height: 1.6;">Olá, <strong>%s</strong>!</p>
                                            <p style="margin: 0 0 30px 0; color: rgba(19, 17, 0, 0.7); font-size: 16px; line-height: 1.6;">
                                                Parabéns por concluir sua atividade. Seu certificado de <strong>%s</strong> em <strong>%s</strong> já está pronto e disponível.
                                            </p>

                                            <!-- Competencies -->
                                            <div style="margin: 0 0 30px 0; padding: 22px; background-color: #f7f7f8; border-radius: 18px; border: 1px solid rgba(19, 17, 0, 0.06);">
                                                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: rgba(19, 17, 0, 0.45); text-transform: uppercase; letter-spacing: 1px;">Competências do certificado</p>
                                                %s
                                            </div>
                                            
                                            <!-- Download Box -->
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="background-color: rgba(252, 209, 96, 0.1); border-radius: 20px; border: 1px dashed #FCD160;">
                                                <tr>
                                                    <td style="padding: 30px; text-align: center;">
                                                        <a href="%s" style="display: inline-block; background-color: #FCD160; color: #131100; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 16px; transition: all 0.2s ease;">
                                                            Download do Certificado (PDF)
                                                        </a>
                                                        <p style="margin: 15px 0 0 0; color: rgba(19, 17, 0, 0.5); font-size: 13px;">Também enviamos uma cópia em anexo.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Additional Info -->
                                            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(19, 17, 0, 0.08);">
                                                <div style="margin-bottom: 25px;">
                                                    <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: 700; color: rgba(19, 17, 0, 0.4); text-transform: uppercase; letter-spacing: 1px;">Código de Autenticidade</p>
                                                    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 16px; color: #131100; font-weight: 700; background: #f7f7f8; padding: 10px 15px; border-radius: 8px; display: inline-block;">%s</p>
                                                </div>
                                                
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                                                    <tr>
                                                        <td style="padding-bottom: 10px;">
                                                            <a href="%s" style="color: #131100; text-decoration: underline; font-size: 14px; font-weight: 600;">Validar autenticidade online</a>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <a href="%s" style="display: inline-block; background-color: #0077b5; color: #ffffff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 10px;">
                                                                Compartilhar no LinkedIn
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 30px 40px; background-color: #f7f7f8; text-align: center;">
                                            <p style="margin: 0; color: rgba(19, 17, 0, 0.4); font-size: 12px; line-height: 1.5;">
                                                Este certificado foi emitido por <strong>%s</strong>.<br>
                                                Muttley Hopes and Prayers &copy; 2026
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(nome, tipo, palestra, competenciasHtml, downloadUrl, codigo, validationUrl, linkedinUrl, organizacao);
    }

    private String buildHtmlEvolucaoCompetencia(String nome, String competencia, float horas, int nivel, String linkedinUrl) {
        String horasFormatadas = formatHoras(horas);
        return """
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #FEFDF6; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%%">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(19, 17, 0, 0.05); border: 1px solid rgba(19, 17, 0, 0.05);">
                                    <tr>
                                        <td align="center" style="padding: 40px 40px 20px 40px;">
                                            <div style="background-color: #FCD160; width: 60px; height: 60px; border-radius: 16px; display: inline-block; line-height: 60px; text-align: center; margin-bottom: 20px;">
                                                <span style="font-size: 32px; font-weight: bold; color: #131100;">M</span>
                                            </div>
                                            <h1 style="margin: 0; color: #131100; font-size: 28px; font-weight: 800;">Novo nível de competência!</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 40px 40px;">
                                            <p style="margin: 0 0 20px 0; color: #131100; font-size: 18px; line-height: 1.6;">Olá, <strong>%s</strong>!</p>
                                            <p style="margin: 0 0 28px 0; color: rgba(19, 17, 0, 0.7); font-size: 16px; line-height: 1.6;">
                                                Você evoluiu na competência <strong>%s</strong>. Agora você possui <strong>%s horas</strong> registradas e alcançou o <strong>nível %d</strong>.
                                            </p>
                                            <div style="background-color: rgba(252, 209, 96, 0.14); border: 1px dashed #FCD160; border-radius: 20px; padding: 28px; text-align: center;">
                                                <p style="margin: 0; color: rgba(19, 17, 0, 0.45); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Competência</p>
                                                <p style="margin: 8px 0 18px 0; color: #131100; font-size: 24px; font-weight: 800;">%s</p>
                                                <span style="display: inline-block; background-color: #FCD160; color: #131100; padding: 12px 22px; border-radius: 999px; font-weight: 800;">Nível %d</span>
                                            </div>
                                            <div style="margin-top: 28px; text-align: center;">
                                                <a href="%s" style="display: inline-block; background-color: #0077b5; color: #ffffff; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 15px;">
                                                    Adicionar competência ao LinkedIn
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 30px 40px; background-color: #f7f7f8; text-align: center;">
                                            <p style="margin: 0; color: rgba(19, 17, 0, 0.4); font-size: 12px; line-height: 1.5;">
                                                Muttley Hopes and Prayers &copy; 2026
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                escapeHtml(nome),
                escapeHtml(competencia),
                horasFormatadas,
                nivel,
                escapeHtml(competencia),
                nivel,
                linkedinUrl
        );
    }

    private String formatHoras(float horas) {
        if (horas == Math.floor(horas)) {
            return String.valueOf((int) horas);
        }
        return String.format(java.util.Locale.US, "%.1f", horas);
    }
}
