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
    const templatePath = path.join(
      __dirname,
      '..',
      '/views/mails',
      `${template}.hbs`,
    );

    const templateSource = fs.readFileSync(templatePath, 'utf8');

    const compiledTemplate = handlebars.compile(templateSource);

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
