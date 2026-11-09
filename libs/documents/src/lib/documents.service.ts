import { Injectable, NotFoundException } from '@nestjs/common';
import { withTenant, TenantStore } from '@spaas/shared';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

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
    // --- 1. SALES INVOICE ---
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

    // --- 2. PURCHASE ORDER ---
    async generatePurchaseOrderPdf(purchaseOrderId: string): Promise<Buffer> {
        const context = TenantStore.getStore();
        if (!context) throw new NotFoundException('No tenant context');

        const orderData = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const orderRes = await tx.execute(sql`
        SELECT po.id, po.order_date, p.name as vendor_name, p.email as vendor_email 
        FROM procurement.purchase_order po
        JOIN masterdata.party p ON p.id = po.vendor_id
        WHERE po.id = ${purchaseOrderId}
      `);

            const linesRes = await tx.execute(sql`
        SELECT i.name as item_name, i.sku, pol.quantity, pol.unit_cost_minor
        FROM procurement.purchase_order_line pol
        JOIN masterdata.item i ON i.id = pol.item_id
        WHERE pol.purchase_order_id = ${purchaseOrderId}
      `);
            return { order: orderRes[0], lines: linesRes };
        });

        if (!orderData.order) throw new NotFoundException('Purchase Order not found');

        const total = orderData.lines.reduce((sum: number, line: any) =>
            sum + (Number(line.quantity) * Number(line.unit_cost_minor) / 100), 0
        );

        const tableBody = [
            ['Item', 'SKU', 'Qty', 'Unit Cost', 'Total'],
            ...orderData.lines.map((line: any) => [
                line.item_name,
                line.sku,
                line.quantity.toString(),
                `$${(Number(line.unit_cost_minor) / 100).toFixed(2)}`,
                `$${((Number(line.quantity) * Number(line.unit_cost_minor)) / 100).toFixed(2)}`
            ])
        ];

        const docDefinition = {
            content: [
                { text: 'SPAAS ERP', style: 'header' },
                { text: 'PURCHASE ORDER', style: 'subheader' },
                { text: `Date: ${orderData.order['order_date']}`, margin: [0, 0, 0, 20] },

                { text: 'Vendor:', style: 'label' },
                { text: orderData.order['vendor_name'], bold: true },
                { text: orderData.order['vendor_email'] || '', margin: [0, 0, 0, 20] },

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

    // --- 3. PRODUCTION ORDER ---
    async generateProductionOrderPdf(orderId: string): Promise<Buffer> {
        const context = TenantStore.getStore();
        if (!context) throw new NotFoundException('No tenant context');

        const orderData = await withTenant(async (tx: PostgresJsDatabase<any>) => {
            const orderRes = await tx.execute(sql`
        SELECT po.id, po.created_at, po.target_quantity, po.status, i.name as product_name, i.sku
        FROM manufacturing.production_order po
        JOIN masterdata.item i ON i.id = po.product_item_id
        WHERE po.id = ${orderId}
      `);

            const bomRes = await tx.execute(sql`
        SELECT i.name as component_name, i.sku as component_sku, b.quantity_required
        FROM manufacturing.bom b
        JOIN masterdata.item i ON i.id = b.component_item_id
        WHERE b.product_item_id = (SELECT product_item_id FROM manufacturing.production_order WHERE id = ${orderId})
      `);
            return { order: orderRes[0], lines: bomRes };
        });

        if (!orderData.order) throw new NotFoundException('Production Order not found');

        const targetQty = Number(orderData.order['target_quantity']);

        const tableBody = [
            ['Component Item', 'SKU', 'Qty Per Unit', 'Total Required'],
            ...orderData.lines.map((line: any) => [
                line.component_name,
                line.component_sku,
                Number(line.quantity_required).toString(),
                (Number(line.quantity_required) * targetQty).toString()
            ])
        ];

        const docDefinition = {
            content: [
                { text: 'SPAAS ERP', style: 'header' },
                { text: 'PRODUCTION ORDER', style: 'subheader' },
                { text: `Date: ${new Date(orderData.order['created_at'] as string).toLocaleDateString()}`, margin: [0, 0, 0, 20] },
                { text: `Status: ${orderData.order['status']}`, bold: true, margin: [0, 0, 0, 20] },

                { text: 'Product to Manufacture:', style: 'label' },
                { text: `${orderData.order['product_name']} (${orderData.order['sku']})`, bold: true, fontSize: 14 },
                { text: `Target Quantity: ${targetQty}`, bold: true, margin: [0, 5, 0, 20] },

                { text: 'Components Required:', style: 'label', margin: [0, 0, 0, 10] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: tableBody
                    }
                }
            ],
            styles: {
                header: { fontSize: 22, bold: true, color: '#2563eb' },
                subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 10] },
                label: { fontSize: 10, color: '#6b7280', bold: true },
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