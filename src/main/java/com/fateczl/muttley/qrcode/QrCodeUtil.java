package com.fateczl.muttley.qrcode;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.ByteArrayOutputStream;

// utilitário responsável por gerar imagens QR Code em formato PNG a partir de um texto
public class QrCodeUtil {

    // gera e retorna os bytes PNG do QR Code para o texto informado com as dimensões especificadas
    public static byte[] gerar(String texto, int largura, int altura) throws Exception {
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(texto, BarcodeFormat.QR_CODE, largura, altura);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        return out.toByteArray();
    }
}
