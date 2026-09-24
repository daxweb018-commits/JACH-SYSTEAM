import { jsPDF } from 'jspdf';
import { SaleRecord, ExpenseRecord, SystemInfo } from '../types/system';

/**
 * Generates and downloads a clean, professional standard A4 PDF Invoice / Receipt for a sale.
 * Standard A4 Paper Dimensions: 210mm x 297mm ONLY.
 */
export function downloadSaleReceiptPDF(sale: SaleRecord, systemInfo: SystemInfo) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // Strict Standard A4 format ONLY (210 x 297 mm)
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182 mm

  const displayInvoiceNum = sale.risitiNumber || '20260924-001';

  // Background Header Accent
  doc.setFillColor(24, 24, 27); // Zinc 900
  doc.roundedRect(margin, margin, contentWidth, 36, 3, 3, 'F');

  // Gold accent line
  doc.setFillColor(246, 186, 53); // #F6BA35
  doc.rect(margin, margin + 35, contentWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(246, 186, 53);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(systemInfo.officeName || 'TANZANIA INTERNATIONAL BEE CO LTD', pageWidth / 2, margin + 9, { align: 'center' });

  // Subtitle / Contact Info
  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`TIN: ${systemInfo.tin || '142-895-301'}   |   Simu: ${systemInfo.phone || '+255 754 889 900'}   |   Email: info@tanbee.co.tz`, pageWidth / 2, margin + 16, { align: 'center' });
  doc.text(systemInfo.address || 'Mwenge Industrial Area, Dar es Salaam, Tanzania', pageWidth / 2, margin + 22, { align: 'center' });

  // Receipt / Invoice Label Badge
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TANZANIA INTERNATIONAL BEE CO LTD', pageWidth / 2, margin + 30, { align: 'center' });

  let y = margin + 43;

  // Invoice Meta Bar (Invoice Number, Date, Category)
  doc.setFillColor(245, 245, 248);
  doc.roundedRect(margin, y, contentWidth, 13, 2, 2, 'F');
  doc.setDrawColor(220, 220, 228);
  doc.roundedRect(margin, y, contentWidth, 13, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 115, 0);
  doc.text('INVOICE NUMBER:', margin + 5, y + 8);
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  doc.text(displayInvoiceNum, margin + 40, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('AINA YA MAUZO:', pageWidth / 2 - 15, y + 8);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'normal');
  doc.text(sale.category === 'vybu_gin' ? 'Vybu Gin (200ml)' : 'Mazao ya Nyuki', pageWidth / 2 + 15, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('TAREHE:', pageWidth - margin - 50, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);
  doc.text(sale.tarehe, pageWidth - margin - 32, y + 8);

  y += 18;

  // Customer and Seller Details Box (Two side-by-side cards on A4)
  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 32;

  // Left Card: Customer Details
  doc.setFillColor(252, 252, 254);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(225, 225, 232);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 115, 0);
  doc.text('TAARIFA ZA MTEJA (CUSTOMER INFO):', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text('Jina la Mteja: ', margin + 5, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 10, 10);
  doc.text(`${sale.mtejaName}`, margin + 28, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(`Simu: ${sale.mtejaPhone || 'Hana Simu'}   |   TIN: ${sale.mtejaTin || 'Hana TIN'}`, margin + 5, y + 21);
  doc.text('Njia ya Malipo: ', margin + 5, y + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 10, 10);
  doc.text(`${sale.paymentMethod || (sale.isCredit ? 'Mkopo' : 'Taslimu')}`, margin + 28, y + 27);

  // Right Card: Seller Details
  const rightCardX = margin + cardWidth + 6;
  doc.setFillColor(252, 252, 254);
  doc.roundedRect(rightCardX, y, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(225, 225, 232);
  doc.roundedRect(rightCardX, y, cardWidth, cardHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 115, 0);
  doc.text('MUUZAJI / MWAKILISHI (SALES REP):', rightCardX + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text('Jina la Afisa: ', rightCardX + 5, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 10, 10);
  doc.text(`${sale.muuzajiName}`, rightCardX + 26, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(`Kitengo: Mauzo na Usambazaji`, rightCardX + 5, y + 21);
  doc.text(`Hali ya Malipo: ${sale.balanceDue === 0 ? 'Mauzo Yaliyolipwa (Taslimu)' : 'Mauzo ya Mkopo (Credit)'}`, rightCardX + 5, y + 27);

  y += cardHeight + 8;

  // Table Headers
  doc.setFillColor(30, 34, 42);
  doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);

  doc.text('#', margin + 3, y + 6);
  doc.text('MAELEZO YA BIDHAA NA HUDUMA', margin + 12, y + 6);
  doc.text('IDADI', margin + 105, y + 6, { align: 'right' });
  doc.text('BEI (TZS)', margin + 142, y + 6, { align: 'right' });
  doc.text('JUMLA (TZS)', margin + contentWidth - 4, y + 6, { align: 'right' });

  y += 10.5;

  // Assemble full items list (including other cost if stored separately)
  const allItems = [...(sale.items || [])];
  const hasOtherCostInItems = allItems.some(i => i.productId === 'prod-other-cost' || i.productName.toLowerCase().includes('usafiri') || i.productName.toLowerCase().includes('other cost'));
  
  if (!hasOtherCostInItems && sale.otherCost && sale.otherCost > 0) {
    allItems.push({
      productId: 'prod-other-cost',
      productName: sale.otherCostDescription || 'Usafiri wa Mzigo',
      category: sale.category,
      quantity: 1,
      unitPrice: sale.otherCost,
      totalPrice: sale.otherCost,
    });
  }

  // Items Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  allItems.forEach((item, index) => {
    const isAlt = index % 2 === 1;
    if (isAlt) {
      doc.setFillColor(248, 249, 252);
      doc.rect(margin, y - 1.5, contentWidth, 9, 'F');
    }

    doc.setTextColor(80, 80, 80);
    doc.text(`${index + 1}`, margin + 3, y + 4.5);

    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    
    // Clean / format description for item
    const isOtherCost = item.productId === 'prod-other-cost' || item.productName.toLowerCase().includes('usafiri') || (index === 1 && allItems.length === 2);
    let displayItemName = item.productName;
    if (isOtherCost) {
      if (!displayItemName.toLowerCase().includes('usafiri')) {
        displayItemName = `Usafiri (${displayItemName})`;
      }
    }

    const cleanName = displayItemName.length > 38 ? displayItemName.substring(0, 35) + '...' : displayItemName;
    doc.text(cleanName, margin + 12, y + 4.5);

    doc.setFont('helvetica', 'normal');
    const unitLabel = isOtherCost ? '1 Huduma' : `${item.quantity} ${item.category === 'vybu_gin' ? 'Box' : 'Kipimo'}`;
    doc.text(unitLabel, margin + 105, y + 4.5, { align: 'right' });
    doc.text(item.unitPrice.toLocaleString(), margin + 142, y + 4.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text(item.totalPrice.toLocaleString(), margin + contentWidth - 4, y + 4.5, { align: 'right' });

    y += 9.5;
  });

  // Divider
  doc.setDrawColor(200, 200, 212);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  // Financial Summary & Status Box (Spacious A4 Layout)
  const summaryBoxY = y;
  const summaryBoxHeight = 40;
  
  // Status Stamp Box on Left
  const stampBoxWidth = 85;
  const isPaid = sale.balanceDue === 0;

  doc.setDrawColor(isPaid ? 34 : 225, isPaid ? 197 : 29, isPaid ? 94 : 72);
  doc.setFillColor(isPaid ? 240 : 254, isPaid ? 253 : 242, isPaid ? 244 : 242);
  doc.roundedRect(margin, summaryBoxY, stampBoxWidth, summaryBoxHeight, 2.5, 2.5, 'FD');

  doc.setTextColor(isPaid ? 22 : 190, isPaid ? 101 : 24, isPaid ? 52 : 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(isPaid ? 'HALI: IMELIPWA KIKAMILIFU' : 'HALI: INADAIWA (MKOPO)', margin + stampBoxWidth / 2, summaryBoxY + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(isPaid ? 'Malipo yote yamekamilika kikamilifu.' : `Baki ya Deni linalodaiwa: TZS ${sale.balanceDue.toLocaleString()}`, margin + stampBoxWidth / 2, summaryBoxY + 20, { align: 'center' });
  doc.text(`Muda wa Muamala: ${new Date(sale.timestamp || Date.now()).toLocaleTimeString('sw-TZ')}`, margin + stampBoxWidth / 2, summaryBoxY + 28, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(`Kumbukumbu ya Risiti: ${displayInvoiceNum}`, margin + stampBoxWidth / 2, summaryBoxY + 34, { align: 'center' });

  // Summary Card on Right
  const rightBoxX = margin + stampBoxWidth + 6;
  const rightBoxWidth = contentWidth - stampBoxWidth - 6;

  doc.setFillColor(250, 250, 253);
  doc.roundedRect(rightBoxX, summaryBoxY, rightBoxWidth, summaryBoxHeight, 2.5, 2.5, 'F');
  doc.setDrawColor(220, 220, 228);
  doc.roundedRect(rightBoxX, summaryBoxY, rightBoxWidth, summaryBoxHeight, 2.5, 2.5, 'S');

  const summaryRightAlignX = rightBoxX + rightBoxWidth - 6;
  const summaryLabelX = rightBoxX + 6;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('Jumla Kuu ya Mauzo (Total):', summaryLabelX, summaryBoxY + 9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 15, 15);
  doc.setFontSize(9.5);
  doc.text(`TZS ${sale.totalKiasi.toLocaleString()}`, summaryRightAlignX, summaryBoxY + 9, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'bold');
  doc.text('Kiasi Kilicholipwa (Paid):', summaryLabelX, summaryBoxY + 18);
  doc.text(`TZS ${sale.amountPaid.toLocaleString()}`, summaryRightAlignX, summaryBoxY + 18, { align: 'right' });

  if (sale.balanceDue > 0) {
    doc.setTextColor(190, 24, 35);
    doc.setFont('helvetica', 'bold');
    doc.text('Baki ya Deni (Balance Due):', summaryLabelX, summaryBoxY + 28);
    doc.setFontSize(10);
    doc.text(`TZS ${sale.balanceDue.toLocaleString()}`, summaryRightAlignX, summaryBoxY + 28, { align: 'right' });
  } else {
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Salio Linalobaki (Balance):', summaryLabelX, summaryBoxY + 28);
    doc.text('TZS 0', summaryRightAlignX, summaryBoxY + 28, { align: 'right' });
  }

  y = summaryBoxY + summaryBoxHeight + 12;

  // Terms and Notes
  doc.setFillColor(252, 252, 254);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');
  doc.setDrawColor(228, 228, 235);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 90, 0);
  doc.text('MASHARTI NA MAELEKEZO RASMI:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('1. Bidhaa zilizothibitishwa na kukaguliwa wakati wa ununuzi hazirudishwi baada ya siku tatu (3) tangu tarehe ya mauzo.', margin + 4, y + 10);
  doc.text('2. Hati hii ni stakabadhi rasmi ya uhasibu na mauzo ya Tanzania International Bee Co Ltd inayotambulika kisheria.', margin + 4, y + 14.5);

  y += 26;

  // Signatures Section (Muuzaji na Mhasibu pekee - saini ya mteja imeondolewa)
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);

  // Signature 1 (Sales Representative)
  doc.setDrawColor(160, 160, 160);
  doc.line(margin + 15, y + 16, margin + 75, y + 16);
  doc.text('Saini ya Muuzaji / Afisa', margin + 45, y + 21, { align: 'center' });

  // Signature 2 (Auditor / Accountant)
  doc.line(margin + contentWidth - 75, y + 16, margin + contentWidth - 15, y + 16);
  doc.text('Uidhinishaji wa Mhasibu', margin + contentWidth - 45, y + 21, { align: 'center' });

  // A4 Footer (Fixed at the bottom of the A4 page)
  const footerY = pageHeight - margin - 5;
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text(`Asante kwa kufanya biashara nasi. Hati hii ni kumbukumbu rasmi ya ununuzi na malipo.`, pageWidth / 2, footerY - 4, { align: 'center' });
  doc.text(`Hati hii imetengenezwa kidijitali kupitia mfumo mkuu wa JACH mnamo ${new Date().toLocaleString('sw-TZ')}  |  Ukubwa: A4 Standard Document`, pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF file
  const filename = `Invoice_A4_${displayInvoiceNum.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Generates and downloads a clean, professional standard A4 PDF payment voucher (Vocha ya Matumizi) for the Accountant.
 * Standard A4 Paper Dimensions: 210mm x 297mm ONLY.
 */
export function downloadExpenseVoucherPDF(voucher: ExpenseRecord, systemInfo: SystemInfo) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // Strict Standard A4 format ONLY (210 x 297 mm)
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Background Header Accent
  doc.setFillColor(24, 24, 27); // Zinc 900
  doc.roundedRect(margin, margin, contentWidth, 36, 3, 3, 'F');

  // Gold accent line
  doc.setFillColor(246, 186, 53);
  doc.rect(margin, margin + 35, contentWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(246, 186, 53);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(systemInfo.officeName || 'TANZANIA INTERNATIONAL BEE CO LTD', pageWidth / 2, margin + 9, { align: 'center' });

  // Subtitle / Contact Info
  doc.setTextColor(200, 200, 200);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`IDARA YA UHASIBU NA FEDHA   |   TIN: ${systemInfo.tin || '142-895-301'}`, pageWidth / 2, margin + 16, { align: 'center' });
  doc.text(`Simu: ${systemInfo.phone || '+255 754 889 900'}   |   ${systemInfo.address || 'Mwenge Industrial Area, Dar es Salaam, Tanzania'}`, pageWidth / 2, margin + 22, { align: 'center' });

  // Voucher Badge
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('VOCHA RASMI YA MALIPO YA MATUMIZI (EXPENSE PAYMENT VOUCHER)', pageWidth / 2, margin + 30, { align: 'center' });

  let y = margin + 43;

  // Voucher Meta
  doc.setFillColor(245, 245, 248);
  doc.roundedRect(margin, y, contentWidth, 13, 2, 2, 'F');
  doc.setDrawColor(220, 220, 228);
  doc.roundedRect(margin, y, contentWidth, 13, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 115, 0);
  doc.text('VOCHA ID:', margin + 5, y + 8);
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  doc.text(voucher.id, margin + 25, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('TAREHE YA MALIPO:', pageWidth - margin - 55, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);
  doc.text(voucher.tarehe, pageWidth - margin - 25, y + 8);

  y += 18;

  // Payee & Department Card
  doc.setFillColor(252, 252, 254);
  doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'F');
  doc.setDrawColor(225, 225, 232);
  doc.roundedRect(margin, y, contentWidth, 36, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 115, 0);
  doc.text('TAARIFA ZA MPOKEAJI NA IDARA (PAYEE DETAILS):', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text('Aliyelipwa Fedha (Mpokeaji): ', margin + 5, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 10, 10);
  doc.text(voucher.aliyeChukua, margin + 50, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Kitengo / Idara Inayohusika: ', margin + 5, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 10, 10);
  doc.text(voucher.kitengo, margin + 50, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Mhasibu Aliyethibitisha: ', margin + 5, y + 31);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 10, 10);
  doc.text(voucher.mhasibuName, margin + 50, y + 31);

  y += 42;

  // Purpose / Description Box
  doc.setFillColor(248, 249, 252);
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'F');
  doc.setDrawColor(220, 220, 228);
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 115, 0);
  doc.text('KUSUDI LA MALIPO NA MAELEZO YA MATUMIZI (PURPOSE):', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  const splitDescription = doc.splitTextToSize(voucher.maelezo || 'Malipo ya uendeshaji wa kampuni', contentWidth - 10);
  doc.text(splitDescription, margin + 5, y + 15);

  y += 34;

  // Amount Highlighting Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(153, 27, 27);
  doc.text('JUMLA YA FEDHA ILIYOTOLEWA (AMOUNT ISSUED):', margin + 5, y + 12);

  doc.setFontSize(14);
  doc.setTextColor(185, 28, 28);
  doc.text(`TZS ${voucher.kiasi.toLocaleString()}`, margin + contentWidth - 6, y + 13, { align: 'right' });

  y += 26;

  // Signature Section
  doc.setFillColor(252, 252, 254);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'F');
  doc.setDrawColor(225, 225, 232);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('UTHIBITISHO NA SAINI ZA MALIPO (SIGNATURES & APPROVAL):', margin + 5, y + 7);

  if (voucher.saini && voucher.saini.startsWith('data:image')) {
    try {
      doc.addImage(voucher.saini, 'PNG', margin + 25, y + 10, 50, 20);
    } catch (e) {
      doc.setFont('times', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text(`✍️ ${voucher.aliyeChukua}`, margin + 25, y + 22);
    }
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(`✍️ ${voucher.saini || voucher.aliyeChukua}`, margin + 25, y + 22);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Saini Halisi ya Mpokeaji', margin + 30, y + 33);
  doc.text('Uidhinishaji wa Mhasibu Mkuu', margin + contentWidth - 55, y + 33);

  // Footer Note
  const footerY = pageHeight - margin - 5;
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(`Hati hii ni kielelezo halali cha fedha iliyotolewa kwenye kitengo cha Uhasibu cha ${systemInfo.officeName}.`, pageWidth / 2, footerY - 4, { align: 'center' });
  doc.text(`Imetolewa kidijitali mnamo ${new Date().toLocaleString('sw-TZ')}  |  Ukubwa: A4 Standard Document`, pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF file
  const filename = `Vocha_Matumizi_A4_${voucher.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(filename);
}

/**
 * Universal print trigger that ensures printing works cleanly in browsers,
 * previews, and iframes on standard A4.
 */
export function triggerPrintDialog() {
  try {
    window.print();
  } catch (err) {
    console.warn('Window print trigger failed:', err);
  }
}

