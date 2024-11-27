import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { Resend } from 'resend';

import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

import * as QRCode from 'qrcode';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async generatePdfWithQrCode(
    ticketId: string,
    eventName: string,
    ticketName: string,
    userName: string,
  ) {
    const ticketUrl = `https://hypereventos.com/tickets/${ticketId}`;

    const qrCodeDataUrl = await QRCode.toDataURL(ticketUrl);
    const qrCodeBase64 = qrCodeDataUrl.split(',')[1]; // Remove o prefixo "data:image/png;base64,"

    // Criar PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(`Evento: ${eventName}`, {
      x: 50,
      y: 550,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Nome: ${userName}`, {
      x: 50,
      y: 530,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Tipo do Ticket: ${ticketName}`, {
      x: 50,
      y: 510,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(`ID do Ticket: ${ticketId}`, {
      x: 50,
      y: 490,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    const qrImage = await pdfDoc.embedPng(Buffer.from(qrCodeBase64, 'base64'));
    const qrImageDims = qrImage.scale(0.5);

    page.drawImage(qrImage, {
      x: 150,
      y: 300,
      width: qrImageDims.width,
      height: qrImageDims.height,
    });

    return await pdfDoc.save();
  }

  async sendEmailWithAttachment(
    to: string,
    subject: string,
    template: string,
    context: any,
    attachment: { content: string; filename: string },
  ) {
    const compiledTemplate = handlebars.compile(
      `
        <html lang='en'>
  <head>
    <meta charset='UTF-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <title>Seu ingresso para o {{eventName}}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0;
      background-color: #f9f9f9; } .container { max-width: 600px; margin: 20px
      auto; background-color: #ffffff; padding: 20px; border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); } .header { text-align: center;
      padding: 10px 0; border-bottom: 1px solid #dddddd; } .header h1 { color:
      #333333; } .content { text-align: center; margin: 20px 0; } .content p {
      font-size: 16px; color: #555555; } .qrcode { margin: 20px auto; } .footer
      { text-align: center; margin-top: 20px; color: #888888; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class='container'>
      <div class='header'>
        <h1>Olá,
          {{name}}! muito obrigado por garantir seu ingresso, você tem um
          encontro marcado dia 13/12 te esperamos lá!</h1>
      </div>
      <div class='content'>
        <p>Você adquiriu um ingresso para o evento
          <strong>{{eventName}}</strong>. Confira os detalhes no PDF anexo.</p>
        <p><strong>ID do Bilhete:</strong> {{ticketId}}</p>
        <p><strong>Tipo do Bilhete:</strong> {{ticketName}}</p>
        <p>Nos vemos no dia do evento!</p>
      </div>
      <div class='footer'>
        <p>&copy; 2024 HyperEventos. Todos os direitos reservados.</p>
      </div>
    </div>
  </body>
</html>
      `,
    );

    const html = compiledTemplate(context);

    await this.resend.emails.send({
      from: 'HyperEventos <no-reply@hypereventos.com>',
      to,
      subject,
      html,
      attachments: [attachment],
    });
  }

  async sendTicketEmail(
    to: string,
    userName: string,
    ticketId: string,
    eventName: string,
    ticketName: string,
  ) {
    // Gerar PDF do ticket
    const pdfBytes = await this.generatePdfWithQrCode(
      ticketId,
      eventName,
      ticketName,
      userName,
    );

    const attachment = {
      content: Buffer.from(pdfBytes).toString('base64'),
      filename: `ticket-${ticketId}.pdf`,
    };

    // Dados do template
    const emailData = {
      eventName,
      name: userName,
      ticketId,
      ticketName,
    };

    // Enviar e-mail com o PDF em anexo
    await this.sendEmailWithAttachment(
      to,
      `Seu ingresso para o ${eventName}`,
      'user/ticket',
      emailData,
      attachment,
    );
  }
}
