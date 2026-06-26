# Apple Shortcut Setup: Receipt Saver

This shortcut appears in your share sheet on iOS and macOS. When you share a receipt image or PDF, it:

1. Asks for vendor name, amount, and category
2. Renames the file: `2026-06-26_Costco_$45.23.jpg`
3. Saves it to iCloud Drive under `Receipts/2026/06-June/`
4. Appends a row to a Numbers or CSV spreadsheet

## Build the Shortcut

Open the **Shortcuts** app and create a new shortcut. Add these actions in order:

### Step 1: Accept Share Sheet Input

- Tap **"Any"** at the top where it says "Receive ___ input from"
- Change it to: **Images, PDFs, Files**
- This makes the shortcut appear in the share sheet

### Step 2: Set Variables for Date

Add action: **Get Current Date**

Add action: **Format Date**
- Format: Custom → `yyyy`
- Save output as variable: `Year`

Add action: **Format Date**
- Format: Custom → `MM-MMMM`
- Save output as variable: `MonthFolder`

Add action: **Format Date**
- Format: Custom → `yyyy-MM-dd`
- Save output as variable: `DatePrefix`

### Step 3: Prompt for Receipt Details

Add action: **Ask for Input**
- Prompt: `Vendor/Store name?`
- Input Type: Text
- Save output as variable: `Vendor`

Add action: **Ask for Input**
- Prompt: `Total amount (e.g. 45.23)?`
- Input Type: Number
- Save output as variable: `Amount`

Add action: **Choose from Menu**
- Prompt: `Category?`
- Options:
  - Groceries
  - Dining
  - Gas
  - Shopping
  - Healthcare
  - Utilities
  - Travel
  - Entertainment
  - Subscriptions
  - Other
- Save output as variable: `Category`

Add action: **Ask for Input** (optional)
- Prompt: `Payment method?`
- Input Type: Text
- Default: `Credit Card`
- Save output as variable: `PaymentMethod`

### Step 4: Rename and Save the File

Add action: **Set Name**
- Input: Shortcut Input
- Name: `DatePrefix`\_`Vendor`\_$`Amount`
- (This produces: `2026-06-26_Costco_$45.23`)

Add action: **Save File**
- Destination: iCloud Drive
- Subpath: `Receipts/Year/MonthFolder/`
- Ask Where to Save: **OFF**
- Overwrite If File Exists: ON

### Step 5: Log to Spreadsheet

**Option A: Append to a CSV file in iCloud Drive**

Add action: **Text**
- Content: `DatePrefix,Vendor,Amount,Category,PaymentMethod,DatePrefix_Vendor_$Amount`

Add action: **Append to File**
- File Path: `Receipts/expense_log.csv`
- Service: iCloud Drive

**Option B: Add Row to a Numbers Spreadsheet**

If you prefer Apple Numbers:

Add action: **Add Row to Numbers Spreadsheet**
- Table: `Expenses`
- Values:
  - Date → `DatePrefix`
  - Vendor → `Vendor`
  - Amount → `Amount`
  - Category → `Category`
  - Payment → `PaymentMethod`

### Step 6: Confirm

Add action: **Show Notification**
- Title: `Receipt Saved`
- Body: `Vendor — $Amount saved to MonthFolder`

## Final Settings

1. Tap the shortcut name at the top → **Shortcut Details**
2. Enable **"Show in Share Sheet"**
3. Set accepted types to **Images, PDFs**
4. Give it a name like **"Save Receipt"**
5. Choose an icon (receipt emoji or dollar sign)

## Tips

- **Batch processing**: You can also run the shortcut manually from the Shortcuts app and pick files from Photos or Files
- **Siri**: Say "Hey Siri, Save Receipt" to trigger it manually
- **Widget**: Add it to your home screen for quick access
- **Apple Watch**: If you set it up, you can trigger it from your watch after taking a photo on your phone

## iCloud Sync

Since files save to iCloud Drive, they automatically sync across all your Apple devices and are accessible from:
- iPhone Files app
- Mac Finder
- iCloud.com
