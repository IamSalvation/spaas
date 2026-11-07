import { Injectable, NotFoundException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

// Using the standard PdfPrinter for pdfmake 0.2.x
const PdfPrinter = require('pdfmake');

const fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};

const printer = new PdfPrinter(fonts);

@Injectable()
export class DocumentsService {
    async generateInvoicePdf(salesOrderId: string): Promise<Buffer> {
        const context = TenantStore.getStore();
        if (!context) throw new NotFoundException('No tenant context');

        const orderData = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const orderRes = await tx.execute(sql`
        SELECT so.id, so.order_date, p.name as customer_name, p.email as customer_email 
        FROM sales.sales_order so
        JOIN masterdata.party p ON p.id = so.customer_id
        WHERE so.id = ${salesOrderId}
      `);

            const linesRes = await tx.execute(sql`
        SELECT i.name as item_name, i.sku, sol.quantity, sol.unit_price_minor
        FROM sales.sales_order_line sol
        JOIN masterdata.item i ON i.id = sol.item_id
        WHERE sol.sales_order_id = ${salesOrderId}
      `);
            return { order: orderRes[0], lines: linesRes };
        });

        if (!orderData.order) throw new NotFoundException('Order not found');

        const total = orderData.lines.reduce((sum: number, line: any) =>
            sum + (Number(line.quantity) * Number(line.unit_price_minor) / 100), 0
        );

        const tableBody = [
            ['Item', 'SKU', 'Qty', 'Unit Price', 'Total'],
            ...orderData.lines.map((line: any) => [
                line.item_name,
                line.sku,
                line.quantity.toString(),
                `$${(Number(line.unit_price_minor) / 100).toFixed(2)}`,
                `$${((Number(line.quantity) * Number(line.unit_price_minor)) / 100).toFixed(2)}`
            ])
        ];

        const docDefinition = {
            content: [
                { text: 'SPAAS ERP', style: 'header' },
                { text: 'INVOICE', style: 'subheader' },
                { text: `Invoice Date: ${orderData.order['order_date']}`, margin: [0, 0, 0, 20] },

                { text: 'Billed To:', style: 'label' },
                { text: orderData.order['customer_name'], bold: true },
                { text: orderData.order['customer_email'] || '', margin: [0, 0, 0, 20] },

                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                        body: tableBody
                    }
                },
                {
                    text: `Total: $${total.toFixed(2)}`,
                    style: 'total',
                    margin: [0, 20, 0, 0]
                }
            ],
            styles: {
                header: { fontSize: 22, bold: true, color: '#2563eb' },
                subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 10] },
                label: { fontSize: 10, color: '#6b7280', bold: true },
                total: { fontSize: 16, bold: true, alignment: 'right' }
            },
            defaultStyle: { font: 'Helvetica' }
        };

        return new Promise((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: any[] = [];
            pdfDoc.on('data', (chunk: any) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err: any) => reject(err));
            pdfDoc.end();
        });
    }
}