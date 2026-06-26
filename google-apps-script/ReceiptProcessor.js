/**
 * Google Apps Script: Receipt Processor
 *
 * Watches a Google Drive folder for new receipt images/PDFs,
 * extracts text via OCR, and logs expenses to a Google Sheet.
 *
 * SETUP:
 * 1. Create a Google Sheet named "Expense Tracker"
 * 2. Create a Google Drive folder named "Receipts"
 * 3. Open Extensions > Apps Script in the sheet
 * 4. Paste this code and save
 * 5. Run setupTrigger() once to enable automatic processing
 * 6. Run setupSheet() once to create headers
 */

const CONFIG = {
  RECEIPT_FOLDER_NAME: 'Receipts',
  SPREADSHEET_NAME: 'Expense Tracker',
  SHEET_NAME: 'Expenses',
  PROCESSED_PROPERTY: 'processedFiles',
};

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  const headers = [
    'Date Added',
    'File Name',
    'Vendor (extracted)',
    'Amount (extracted)',
    'Category',
    'Payment Method',
    'OCR Text',
    'File Link',
    'Notes',
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  sheet.setColumnWidth(1, 120); // Date
  sheet.setColumnWidth(2, 200); // File Name
  sheet.setColumnWidth(3, 150); // Vendor
  sheet.setColumnWidth(4, 100); // Amount
  sheet.setColumnWidth(5, 120); // Category
  sheet.setColumnWidth(6, 130); // Payment
  sheet.setColumnWidth(7, 300); // OCR Text
  sheet.setColumnWidth(8, 200); // Link
}

function setupTrigger() {
  // Remove existing triggers to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === 'processNewReceipts') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Check for new receipts every 15 minutes
  ScriptApp.newTrigger('processNewReceipts')
    .timeDriven()
    .everyMinutes(15)
    .create();

  Logger.log('Trigger created: processNewReceipts runs every 15 minutes');
}

function processNewReceipts() {
  const folder = getOrCreateFolder(CONFIG.RECEIPT_FOLDER_NAME);
  const processed = getProcessedFiles();
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    const fileId = file.getId();

    if (processed.has(fileId)) continue;

    try {
      processReceiptFile(file);
      processed.add(fileId);
    } catch (e) {
      Logger.log('Error processing ' + file.getName() + ': ' + e.message);
    }
  }

  // Also check monthly subfolders
  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    const subfolder = subfolders.next();
    const subfiles = subfolder.getFiles();
    while (subfiles.hasNext()) {
      const file = subfiles.next();
      const fileId = file.getId();
      if (processed.has(fileId)) continue;
      try {
        processReceiptFile(file);
        processed.add(fileId);
      } catch (e) {
        Logger.log('Error processing ' + file.getName() + ': ' + e.message);
      }
    }
  }

  saveProcessedFiles(processed);
}

function processReceiptFile(file) {
  const mimeType = file.getMimeType();
  let ocrText = '';

  if (mimeType.startsWith('image/')) {
    ocrText = extractTextFromImage(file);
  } else if (mimeType === 'application/pdf') {
    ocrText = extractTextFromPdf(file);
  } else {
    Logger.log('Skipping unsupported file type: ' + mimeType);
    return;
  }

  const extracted = parseReceiptText(ocrText);
  logToSheet(file, extracted, ocrText);

  // Move to monthly subfolder
  organizeIntoMonthFolder(file);
}

function extractTextFromImage(file) {
  // Use Google Drive's built-in OCR by converting image to Google Doc
  const resource = {
    title: 'OCR_TEMP_' + file.getName(),
    mimeType: file.getMimeType(),
  };

  const options = {
    ocr: true,
    ocrLanguage: 'en',
  };

  const blob = file.getBlob();
  const ocrFile = Drive.Files.insert(resource, blob, options);
  const doc = DocumentApp.openById(ocrFile.id);
  const text = doc.getBody().getText();

  // Clean up temp file
  DriveApp.getFileById(ocrFile.id).setTrashed(true);

  return text;
}

function extractTextFromPdf(file) {
  const resource = {
    title: 'OCR_TEMP_' + file.getName(),
    mimeType: 'application/pdf',
  };

  const options = {
    ocr: true,
    ocrLanguage: 'en',
  };

  const blob = file.getBlob();
  const ocrFile = Drive.Files.insert(resource, blob, options);
  const doc = DocumentApp.openById(ocrFile.id);
  const text = doc.getBody().getText();

  DriveApp.getFileById(ocrFile.id).setTrashed(true);

  return text;
}

function parseReceiptText(text) {
  const result = {
    vendor: '',
    amount: '',
    category: '',
    paymentMethod: '',
  };

  // Extract vendor: usually the first non-empty line
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    result.vendor = lines[0].trim().substring(0, 50);
  }

  // Extract total amount: look for patterns like "Total: $XX.XX" or "TOTAL $XX.XX"
  const totalPatterns = [
    /(?:total|grand total|amount due|balance due|total due)\s*[:\s]*\$?\s*(\d+[.,]\d{2})/i,
    /\$\s*(\d+[.,]\d{2})\s*$/m,
    /(\d+[.,]\d{2})\s*(?:total|due)/i,
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.amount = match[1].replace(',', '.');
      break;
    }
  }

  // Detect payment method
  const paymentPatterns = [
    { pattern: /visa/i, method: 'Visa' },
    { pattern: /mastercard|mc/i, method: 'Mastercard' },
    { pattern: /amex|american express/i, method: 'Amex' },
    { pattern: /discover/i, method: 'Discover' },
    { pattern: /debit/i, method: 'Debit' },
    { pattern: /cash/i, method: 'Cash' },
    { pattern: /apple pay/i, method: 'Apple Pay' },
  ];

  for (const { pattern, method } of paymentPatterns) {
    if (pattern.test(text)) {
      result.paymentMethod = method;
      break;
    }
  }

  // Guess category from common keywords
  const categoryPatterns = [
    { pattern: /grocery|kroger|walmart|costco|safeway|trader joe|whole foods|aldi/i, category: 'Groceries' },
    { pattern: /restaurant|cafe|coffee|starbucks|mcdonald|burger|pizza|diner/i, category: 'Dining' },
    { pattern: /gas|shell|chevron|exxon|mobil|fuel|bp\b/i, category: 'Gas' },
    { pattern: /pharmacy|cvs|walgreens|rx|prescription|medical|doctor|clinic/i, category: 'Healthcare' },
    { pattern: /amazon|target|best buy|home depot|lowes|ikea/i, category: 'Shopping' },
    { pattern: /electric|water|internet|phone|utility|at&t|verizon|comcast/i, category: 'Utilities' },
    { pattern: /hotel|airbnb|airline|flight|uber|lyft/i, category: 'Travel' },
  ];

  for (const { pattern, category } of categoryPatterns) {
    if (pattern.test(text)) {
      result.category = category;
      break;
    }
  }

  return result;
}

function logToSheet(file, extracted, ocrText) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  }

  const row = [
    new Date(),
    file.getName(),
    extracted.vendor,
    extracted.amount ? parseFloat(extracted.amount) : '',
    extracted.category,
    extracted.paymentMethod,
    ocrText.substring(0, 500),
    file.getUrl(),
    '',
  ];

  sheet.appendRow(row);
}

function organizeIntoMonthFolder(file) {
  const parentFolder = getOrCreateFolder(CONFIG.RECEIPT_FOLDER_NAME);
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthFolderName = month + '-' + monthNames[now.getMonth()];

  let yearFolder = getOrCreateSubfolder(parentFolder, year);
  let monthFolder = getOrCreateSubfolder(yearFolder, monthFolderName);

  // Move file if not already in the month folder
  const parents = file.getParents();
  while (parents.hasNext()) {
    const parent = parents.next();
    if (parent.getId() !== monthFolder.getId()) {
      monthFolder.addFile(file);
      parent.removeFile(file);
    }
  }
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(name);
}

function getOrCreateSubfolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(name);
}

function getProcessedFiles() {
  const props = PropertiesService.getScriptProperties();
  const data = props.getProperty(CONFIG.PROCESSED_PROPERTY);
  return new Set(data ? JSON.parse(data) : []);
}

function saveProcessedFiles(processed) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(CONFIG.PROCESSED_PROPERTY, JSON.stringify([...processed]));
}

/**
 * Manual trigger: process all unprocessed receipts now.
 * Run this from the Apps Script editor to process immediately.
 */
function processNow() {
  processNewReceipts();
  Logger.log('Manual processing complete.');
}
