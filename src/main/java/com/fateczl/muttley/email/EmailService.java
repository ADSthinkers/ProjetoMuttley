package com.fateczl.muttley.email;

import com.fateczl.muttley.certificado.Certificado;
import com.fateczl.muttley.certificado.TipoCertificado;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCertificado(Certificado cert, byte[] pdfBytes) {
        String email = cert.getEmailTitular();
        if (email == null || email.isBlank()) return;

        try {
            String validationUrl = baseUrl + "/certificado/validar/" + cert.getCodigoValidacao();
            String linkedinUrl = buildLinkedInUrl(cert, validationUrl);
            boolean isApresentacao = cert.getTipo() == TipoCertificado.APRESENTACAO;
            String tipoCert = isApresentacao ? "Apresentação" : "Participação";
            String nomePalestra = cert.getPalestra() != null ? cert.getPalestra().getTitulo() : "Atividade";
            String orgName = resolverOrganizacao(cert);

            String assunto = "Seu Certificado de " + tipoCert + " — " + nomePalestra;
            String corpo = buildHtmlEmail(cert.getNomeTitular(), nomePalestra, tipoCert,
                    validationUrl, linkedinUrl, cert.getCodigoValidacao(), orgName);

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

    private String buildHtmlEmail(String nome, String palestra, String tipo,
                                   String validationUrl, String linkedinUrl,
                                   String codigo, String organizacao) {
        return """
                <!DOCTYPE html>
                <html lang="pt-br">
                <head><meta charset="UTF-8"></head>
                <body style="font-family:'Segoe UI',sans-serif;background:#f0f2f5;padding:30px;margin:0;">
                  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;
                              padding:2.5rem;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                    <h2 style="color:#007bff;margin-bottom:0.3rem;">Certificado de %s</h2>
                    <p style="color:#555;margin-top:0;">%s</p>

                    <p style="font-size:1rem;color:#333;">Olá, <strong>%s</strong>!</p>
                    <p style="color:#555;">
                      Seu certificado de <strong>%s</strong> na atividade
                      <strong>%s</strong> está disponível em anexo neste e-mail.
                    </p>

                    <div style="background:#f8f9fa;border-radius:8px;padding:1rem;margin:1.5rem 0;">
                      <p style="margin:0 0 0.5rem;font-size:0.85rem;color:#888;font-weight:600;
                                text-transform:uppercase;">Código de Validação</p>
                      <p style="margin:0;font-family:monospace;color:#0056b3;font-size:0.9rem;">%s</p>
                      <p style="margin:0.5rem 0 0;font-size:0.82rem;">
                        <a href="%s" style="color:#007bff;">Validar certificado online</a>
                      </p>
                    </div>

                    <div style="text-align:center;margin:1.5rem 0;">
                      <a href="%s"
                         style="display:inline-block;background:#0077b5;color:#fff;
                                padding:0.75rem 1.8rem;border-radius:8px;text-decoration:none;
                                font-weight:600;font-size:0.95rem;">
                        &#128241; Adicionar ao LinkedIn
                      </a>
                      <p style="font-size:0.78rem;color:#aaa;margin-top:0.5rem;">
                        Emitido por %s
                      </p>
                    </div>

                  </div>
                </body>
                </html>
                """.formatted(tipo, palestra, nome, tipo, palestra, codigo,
                validationUrl, linkedinUrl, organizacao);
    }
}
