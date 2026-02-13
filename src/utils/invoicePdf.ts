import jsPDF from 'jspdf';
import { Invoice, Account } from '../types';

interface OrgDetails {
  name: string;
  abn?: string;
  logo_url?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  bank_name?: string;
  bank_bsb?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  invoice_notes?: string;
  invoice_footer?: string;
}

export function generateInvoicePDF(
  invoice: Invoice,
  account: Account | undefined,
  orgDetails: OrgDetails
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // --- HEADER SECTION ---
  // Company Logo (if provided)
  if (orgDetails.logo_url) {
    try {
      // Note: jsPDF requires images to be loaded from data URLs
      // In production, you'd need to convert the URL to base64
      // For now, we'll skip the logo and just show company name
      // doc.addImage(orgDetails.logo_url, 'PNG', margin, yPos, 40, 15);
    } catch (e) {
      console.error('Error loading logo:', e);
    }
  }

  // Company Name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(orgDetails.name || 'Your Company', margin, yPos + 5);

  // TAX INVOICE header (top right)
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185); // Blue color
  doc.text('TAX INVOICE', pageWidth - margin - 60, yPos + 5);

  yPos += 15;

  // Company Details (left side)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);

  if (orgDetails.abn) {
    doc.text(`ABN: ${orgDetails.abn}`, margin, yPos);
    yPos += 5;
  }

  if (orgDetails.address_line1) {
    doc.text(orgDetails.address_line1, margin, yPos);
    yPos += 5;
  }

  if (orgDetails.address_line2) {
    doc.text(orgDetails.address_line2, margin, yPos);
    yPos += 5;
  }

  const cityLine = [orgDetails.city, orgDetails.state, orgDetails.postcode].filter(Boolean).join(', ');
  if (cityLine) {
    doc.text(cityLine, margin, yPos);
    yPos += 5;
  }

  if (orgDetails.phone) {
    doc.text(`Phone: ${orgDetails.phone}`, margin, yPos);
    yPos += 5;
  }

  if (orgDetails.email) {
    doc.text(`Email: ${orgDetails.email}`, margin, yPos);
    yPos += 5;
  }

  if (orgDetails.website) {
    doc.text(orgDetails.website, margin, yPos);
    yPos += 5;
  }

  // Invoice Details (right side)
  yPos = margin + 15;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const invoiceDetailsX = pageWidth - margin - 55;
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Number:', invoiceDetailsX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNumber, invoiceDetailsX + 35, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Issue Date:', invoiceDetailsX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.issueDate).toLocaleDateString('en-AU'), invoiceDetailsX + 35, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Due Date:', invoiceDetailsX, yPos);
  doc.setFont('helvetica', 'normal');
  const dueDate = new Date(invoice.dueDate);
  const isOverdue = dueDate < new Date() && invoice.status !== 'Paid';
  if (isOverdue) {
    doc.setTextColor(200, 0, 0); // Red for overdue
  }
  doc.text(dueDate.toLocaleDateString('en-AU'), invoiceDetailsX + 35, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  // --- BILL TO SECTION ---
  yPos = Math.max(yPos, 75); // Ensure we're below header
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', margin, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(account?.name || 'Unknown Customer', margin, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  if (account?.email) {
    doc.text(account.email, margin, yPos);
    yPos += 5;
  }

  if (account?.phone) {
    doc.text(account.phone, margin, yPos);
    yPos += 5;
  }

  if (account?.billingAddress) {
    const addr = account.billingAddress;
    doc.text(addr.street || '', margin, yPos);
    yPos += 5;
    const addrLine2 = [addr.suburb, addr.state, addr.postcode].filter(Boolean).join(', ');
    if (addrLine2) {
      doc.text(addrLine2, margin, yPos);
      yPos += 5;
    }
  }

  yPos += 10;
  doc.setTextColor(0, 0, 0);

  // --- LINE ITEMS TABLE ---
  doc.setFontSize(10);

  // Table headers
  const tableStartY = yPos;
  const colX = {
    description: margin,
    qty: pageWidth - 120,
    unitPrice: pageWidth - 95,
    taxRate: pageWidth - 70,
    tax: pageWidth - 50,
    amount: pageWidth - margin - 30
  };

  // Header background
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('DESCRIPTION', colX.description, yPos);
  doc.text('QTY', colX.qty, yPos);
  doc.text('PRICE', colX.unitPrice, yPos);
  doc.text('TAX', colX.taxRate, yPos);
  doc.text('AMOUNT', colX.amount, yPos);

  yPos += 8;

  // Line items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  invoice.lineItems.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    doc.text(item.description, colX.description, yPos);
    doc.text(String(item.qty), colX.qty, yPos);
    doc.text(`$${item.unitPrice.toFixed(2)}`, colX.unitPrice, yPos);
    doc.text(`${item.taxRate}%`, colX.taxRate, yPos);
    doc.text(`$${item.lineTotal.toFixed(2)}`, colX.amount, yPos, { align: 'right' });

    yPos += 7;

    // Separator line
    if (index < invoice.lineItems.length - 1) {
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    }
  });

  yPos += 5;

  // --- TOTALS SECTION ---
  const totalsX = pageWidth - margin - 60;
  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX - 5, yPos, pageWidth - margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
  yPos += 7;

  doc.text('GST (10%):', totalsX, yPos);
  doc.text(`$${invoice.taxTotal.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
  yPos += 7;

  // Total line
  doc.setDrawColor(0, 0, 0);
  doc.line(totalsX - 5, yPos - 2, pageWidth - margin, yPos - 2);
  yPos += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, yPos);
  doc.text(`$${invoice.total.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });

  yPos += 15;

  // --- PAYMENT DETAILS SECTION ---
  if (orgDetails.bank_name) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PAYMENT DETAILS', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);

    doc.text(`Bank: ${orgDetails.bank_name}`, margin, yPos);
    yPos += 5;

    if (orgDetails.bank_bsb) {
      doc.text(`BSB: ${orgDetails.bank_bsb}`, margin, yPos);
      yPos += 5;
    }

    if (orgDetails.bank_account_number) {
      doc.text(`Account Number: ${orgDetails.bank_account_number}`, margin, yPos);
      yPos += 5;
    }

    if (orgDetails.bank_account_name) {
      doc.text(`Account Name: ${orgDetails.bank_account_name}`, margin, yPos);
      yPos += 5;
    }

    yPos += 5;
    doc.setTextColor(0, 0, 0);
  }

  // --- NOTES SECTION ---
  if (invoice.notes || orgDetails.invoice_notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('NOTES:', margin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const notes = invoice.notes || orgDetails.invoice_notes || '';
    yPos = addWrappedText(notes, margin, yPos, pageWidth - 2 * margin, 9);
    yPos += 5;
  }

  // --- FOOTER ---
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');

  if (orgDetails.invoice_footer) {
    const footerLines = doc.splitTextToSize(orgDetails.invoice_footer, pageWidth - 2 * margin);
    doc.text(footerLines, pageWidth / 2, footerY, { align: 'center' });
  } else {
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  }

  // Save PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
