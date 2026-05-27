import { jsPDF } from 'jspdf';
import {
  PDF_CONFIG,
  CANVAS_CONFIG,
  FILE_SETTINGS,
} from '../constants/appConstants.js';
import {
  loadImageAsBase64,
  isCordovaOrCapacitor,
  hasCordovaFileAndSharing,
  b64toBlob,
} from './utils.js';

// Helper function to add user information line at bottom of PDF
export function addUserInfoLine(doc, t) {
  const lineY = PDF_CONFIG.PAGE_HEIGHT - PDF_CONFIG.BOTTOM_MARGIN;

  // Set font for user info
  doc.setFontSize(PDF_CONFIG.USER_INFO_FONT_SIZE);
  doc.setFont(undefined, 'normal');

  // User Name
  doc.text(t('pdf.userInfo.name'), PDF_CONFIG.MARGIN, lineY);
  doc.line(
    PDF_CONFIG.MARGIN + PDF_CONFIG.USER_INFO.NAME_OFFSET,
    lineY + 1,
    PDF_CONFIG.MARGIN + PDF_CONFIG.USER_INFO.NAME_OFFSET + PDF_CONFIG.USER_INFO.LINE_LENGTH,
    lineY + 1,
  );

  // Date
  doc.text(
    t('pdf.userInfo.date'),
    PDF_CONFIG.MARGIN + PDF_CONFIG.USER_INFO.FIELD_SPACING,
    lineY,
  );
  doc.line(
    PDF_CONFIG.MARGIN + PDF_CONFIG.USER_INFO.FIELD_SPACING + PDF_CONFIG.USER_INFO.DATE_OFFSET,
    lineY + 1,
    PDF_CONFIG.MARGIN +
      PDF_CONFIG.USER_INFO.FIELD_SPACING +
      PDF_CONFIG.USER_INFO.DATE_OFFSET +
      PDF_CONFIG.USER_INFO.LINE_LENGTH,
    lineY + 1,
  );

  // Class
  doc.text(
    t('pdf.userInfo.class'),
    PDF_CONFIG.MARGIN + PDF_CONFIG.USER_INFO.FIELD_SPACING * 2,
    lineY,
  );
  doc.line(
    PDF_CONFIG.MARGIN +
      PDF_CONFIG.USER_INFO.FIELD_SPACING * 2 +
      PDF_CONFIG.USER_INFO.CLASS_OFFSET,
    lineY + 1,
    PDF_CONFIG.MARGIN +
      PDF_CONFIG.USER_INFO.FIELD_SPACING * 2 +
      PDF_CONFIG.USER_INFO.CLASS_OFFSET +
      PDF_CONFIG.USER_INFO.LINE_LENGTH,
    lineY + 1,
  );
}

// Helper function to add watermark to PDF
export function addWatermarkToPdf(doc, t) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = CANVAS_CONFIG.CROSS_ORIGIN;
    img.onload = function () {
      try {
        // Create a canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext(CANVAS_CONFIG.CONTEXT_TYPE);

        // Set canvas size to match A4 dimensions
        canvas.width = PDF_CONFIG.PAGE_WIDTH * PDF_CONFIG.WATERMARK.DPI_CONVERSION;
        canvas.height = PDF_CONFIG.PAGE_HEIGHT * PDF_CONFIG.WATERMARK.DPI_CONVERSION;

        // Fill canvas with semi-transparent background
        ctx.fillStyle = `rgba(255, 255, 255, ${PDF_CONFIG.WATERMARK.BACKGROUND_OPACITY})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate dimensions to cover the whole page while maintaining aspect ratio
        const imgAspectRatio = img.width / img.height;
        const pageAspectRatio = canvas.width / canvas.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspectRatio > pageAspectRatio) {
          // Image is wider, fit to height
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgAspectRatio;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller, fit to width
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgAspectRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }

        // Set global alpha for transparency
        ctx.globalAlpha = PDF_CONFIG.WATERMARK.OPACITY;

        // Draw the image to cover the whole page
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Convert canvas to data URL
        const watermarkDataUrl = canvas.toDataURL(CANVAS_CONFIG.IMAGE_FORMAT);

        // Add watermark to PDF (behind all content) with margins
        const watermarkWidth =
          PDF_CONFIG.PAGE_WIDTH * (1 - 2 * PDF_CONFIG.WATERMARK.MARGIN_PERCENT);
        const watermarkHeight =
          PDF_CONFIG.PAGE_HEIGHT * (1 - 2 * PDF_CONFIG.WATERMARK.MARGIN_PERCENT);
        const xOffset = PDF_CONFIG.PAGE_WIDTH * PDF_CONFIG.WATERMARK.MARGIN_PERCENT;
        const yOffset = PDF_CONFIG.PAGE_HEIGHT * PDF_CONFIG.WATERMARK.MARGIN_PERCENT;

        doc.addImage(
          watermarkDataUrl,
          'PNG',
          xOffset,
          yOffset,
          watermarkWidth,
          watermarkHeight,
          undefined,
          'NONE',
        );

        resolve();
      } catch {
        resolve(); // Continue without watermark
      }
    };

    img.onerror = function () {
      console.warn(t('pdf.watermark.failedToLoad'));
      resolve(); // Continue without watermark
    };

    // Load the logo from public folder
    img.src = '/logo.webp';
  });
}

export async function downloadPassagePdf(passage, t) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Add watermark to the first page
  await addWatermarkToPdf(doc, t);

  // Set Title
  doc.setFontSize(24);
  doc.text(passage.title, 15, 15);

  // Set Passage Content
  doc.setFontSize(16);
  const passageLines = doc.splitTextToSize(passage.passage, 180);
  doc.text(passageLines, 15, 25);

  let yStart = 25 + passageLines.length * 7; // arough estimation of text height

  // Set Questions
  doc.setFontSize(12);
  passage.questions.forEach((q, qIndex) => {
    if (yStart > 250) {
      doc.addPage();
      addWatermarkToPdf(doc, t);
      yStart = 15;
    }
    yStart += 10;
    const questionLines = doc.splitTextToSize(`${qIndex + 1}. ${q.question}`, 180);
    doc.text(questionLines, 15, yStart);
    yStart += questionLines.length * 7;

    q.options.forEach((option) => {
      yStart += 7;
      doc.text(`  - ${option}`, 20, yStart);
    });
  });

  // Add user information line at bottom of each page
  addUserInfoLine(doc, t);

  const pdfBlob = doc.output('blob');
  const fileName = FILE_SETTINGS.DEFAULT_PASSAGE_PDF_NAME;

  // Improved platform detection
  const isNative = isCordovaOrCapacitor();
  const hasPlugins = hasCordovaFileAndSharing();

  if (isNative && hasPlugins) {
    // Save PDF to file and offer to open/share it
    savePdfToFile(pdfBlob, fileName, function (err, fileUrl) {
      if (err) {
        alert(t('pdf.pdf.failedToSave') + err);
        console.error('Cordova file save error:', err);
      } else {
        sharePdfWithCordova(fileUrl, t);
      }
    });
  } else if (
    typeof navigator !== 'undefined' &&
    navigator.canShare &&
    navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })
  ) {
    // Web Share API (browser)
    try {
      await navigator.share({
        files: [new File([pdfBlob], fileName, { type: 'application/pdf' })],
        title: t('pdf.pdf.shareTitle'),
        text: t('pdf.pdf.shareText'),
      });
    } catch (err) {
      alert(t('pdf.pdf.sharingFailed') + err);
      console.error('Web Share API error:', err);
    }
  } else {
    // Fallback: try to download the file
    try {
      if (window && window.URL && window.URL.createObjectURL) {
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        requestAnimationFrame(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
        console.log(t('pdf.pdf.downloadedMessage'));
      } else {
        throw new Error(t('pdf.pdf.downloadNotSupported'));
      }
    } catch (err) {
      alert(t('pdf.pdf.sharingAndDownloadNotSupported'));
      console.error(t('pdf.pdf.noSupport'), err);
    }
  }
}

// Helper to save PDF to file using Cordova File plugin
export function savePdfToFile(pdfBlob, fileName, callback) {
  const reader = new FileReader();
  reader.onloadend = function () {
    const base64data = reader.result.split(',')[1]; // Remove data:application/pdf;base64,
    // Save to device
    window.resolveLocalFileSystemURL(
      window.cordova.file.cacheDirectory || window.cordova.file.externalDataDirectory,
      function (dirEntry) {
        dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
          fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function () {
              callback(null, fileEntry.nativeURL);
            };
            fileWriter.onerror = function (e) {
              callback(e);
            };
            const dataBlob = b64toBlob(base64data, 'application/pdf');
            fileWriter.write(dataBlob);
          });
        });
      },
      function (err) {
        callback(err);
      },
    );
  };
  reader.readAsDataURL(pdfBlob);
}

// Helper to share PDF using Cordova Social Sharing plugin
export function sharePdfWithCordova(fileUrl, t) {
  if (window.plugins && window.plugins.socialsharing) {
    window.plugins.socialsharing.share(
      t('pdf.pdf.shareText'),
      t('pdf.pdf.shareTitle'),
      fileUrl,
      null,
      function () {
        console.log(t('pdf.pdf.shareSuccess'));
      },
      function (err) {
        alert(t('pdf.pdf.shareFailed') + err);
      },
    );
  } else {
    alert(t('pdf.pdf.sharingNotAvailable'));
  }
}
