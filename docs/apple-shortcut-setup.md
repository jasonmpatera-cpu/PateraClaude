# Apple Shortcut: Automatic Receipt Processor

An Apple Shortcut that uses **ChatGPT** (via Apple Intelligence) to automatically read a receipt image, extract the vendor/amount/description, log it to a spreadsheet, and file it into the correct monthly folder — all from the share sheet with zero manual input.

## Requirements

- iPhone 15 Pro / iPhone 16 or later, or any M-series iPad/Mac
- iOS 18.1+ / macOS 15.1+ with Apple Intelligence enabled
- Settings → Apple Intelligence & Siri → Apple Intelligence: **ON**
- ChatGPT integration enabled in Settings → Apple Intelligence & Siri → ChatGPT

## How It Works

1. You share a receipt photo/screenshot/PDF from any app
2. ChatGPT reads the receipt image directly and extracts vendor, total, and item description
4. The shortcut renames the file, saves it to the right monthly folder, and adds a row to your spreadsheet

**No typing required.** The whole thing runs automatically.

---

## Build the Shortcut

Open the **Shortcuts** app → tap **+** to create a new shortcut.

### Step 1: Accept Share Sheet Input

- At the very top, tap where it says **"Receive Any input from"**
- Change input type to: **Images, PDFs, Files**
- This makes the shortcut appear when you tap the share button on any receipt

### Step 2: Send Receipt to ChatGPT for Analysis

ChatGPT can read receipt images directly — no separate text extraction step needed.

Search for "ChatGPT" in the actions search bar and add the **Use ChatGPT** action. The UI reads:

> **Use** `ChatGPT` ⓥ

With a large text box below it. In the text box:

1. First, tap the variables bar above the keyboard and insert **Shortcut Input** — this passes the receipt image directly to ChatGPT (it will appear as a blue pill)
2. Then type the rest of the prompt after it:

The text box should look like this:

> **Shortcut Input** Analyze this receipt image and respond with ONLY these 3 lines, nothing else:
> VENDOR: [store/merchant name]
> AMOUNT: [total amount as a number like 45.23]
> ITEM DESCRIPTION: [descriptor of item purchased]

Below the text box you'll see two options:
- **Follow Up:** leave OFF
- **Output:** leave as **Automatic**

The result of this action is called **Response** — you'll use it in the next step.

### Step 3: Parse the ChatGPT Response into Variables

ChatGPT will return something like:
```
VENDOR: Costco
AMOUNT: 45.23
ITEM DESCRIPTION: Bulk groceries and household supplies
```

We need to split this into separate variables. Each action below shows exactly how the UI reads — fill in the blanks as described.

---

**4a. Split the response into lines**

Add action: **Split Text**. The UI reads:

> **Split** `Response` **by** `New Lines`

- Tap the first blank and select the **Response** result from the ChatGPT action above (it appears as a green pill labeled **Response**)
- Tap the second blank ("by") and choose **New Lines**

---

**4b. Get line 1 (vendor)**

Add action: **Get Item from List**. The UI reads:

> **Get** `Item at Index` `1` **from** `Split Text`

- Tap the first blank, change from "First Item" to **Item at Index**, then type `1`
- Tap "from" and select the **Split Text** result

**4c. Strip the VENDOR label**

Add action: **Replace Text**. The UI reads:

> **Replace** `VENDOR: ` **with** ` ` **in** `Item from List`

- **Replace** (first blank): type `VENDOR: ` (include the space after the colon)
- **with** (second blank): leave it empty — tap the field but don't type anything
- **in** (third blank): tap it and select **Item from List** (the result from step 4b)
- Leave **Case Sensitive** and **Regular Expression** toggled OFF

Add action: **Set Variable**. The UI reads:

> **Set** `variable` **to** `Replace Text`

- Tap `variable` and type `Vendor`
- The "to" field should automatically show **Replace Text** (the output of the previous action). If not, tap it and select the Replace Text result.

---

**4d. Get line 2 (amount)**

Add action: **Get Item from List**. The UI reads:

> **Get** `Item at Index` `2` **from** `Split Text`

- Set index to `2`
- For "from", scroll up and select the **Split Text** result (from step 4a, not 4b)

**4e. Strip the AMOUNT label**

Add action: **Replace Text**. The UI reads:

> **Replace** `AMOUNT: ` **with** ` ` **in** `Item from List`

- **Replace**: type `AMOUNT: `
- **with**: leave empty
- **in**: select the **Item from List** result from step 4d

Add action: **Set Variable**. The UI reads:

> **Set** `variable` **to** `Replace Text`

- Tap `variable` and type `Amount`
- "to" should automatically show **Replace Text**

---

**4f. Get line 3 (item description)**

Add action: **Get Item from List**. The UI reads:

> **Get** `Item at Index` `3` **from** `Split Text`

- Set index to `3`
- For "from", scroll up and select the **Split Text** result (from step 4a)

**4g. Strip the ITEM DESCRIPTION label**

Add action: **Replace Text**. The UI reads:

> **Replace** `ITEM DESCRIPTION: ` **with** ` ` **in** `Item from List`

- **Replace**: type `ITEM DESCRIPTION: `
- **with**: leave empty
- **in**: select the **Item from List** result from step 4f

Add action: **Set Variable**. The UI reads:

> **Set** `variable` **to** `Replace Text`

- Tap `variable` and type `Description`
- "to" should automatically show **Replace Text**

---

> **Tip — Using variables:** After setting a variable with the Set Variable action, you can use it in any later action by tapping an input field and selecting the variable name from the variables bar above the keyboard.

### Step 4: Set Up Date Variables

1. Add action: **Date**
   - This gives you the current date and time

2. Add action: **Format Date**
   - Tap input and select the Date result
   - Date Format: **Custom**
   - Custom Format: `yyyy`

3. Add action: **Set Variable**
   - Tap `variable` and type `Year`
   - "to" should show **Formatted Date**

4. Add action: **Format Date**
   - Tap input and select the **Date** result (from step 1 — not the Formatted Date)
   - Date Format: **Custom**
   - Custom Format: `MM-MMMM`

5. Add action: **Set Variable**
   - Tap `variable` and type `MonthFolder`

6. Add action: **Format Date**
   - Tap input and select the **Date** result (from step 1)
   - Date Format: **Custom**
   - Custom Format: `yyyy-MM-dd`

7. Add action: **Set Variable**
   - Tap `variable` and type `DatePrefix`

### Step 5: Rename and File the Receipt

Add action: **Set Name**. The UI reads:

> **Set name of** `Shortcut Input` **to** `___`

- The first part should auto-fill with **Shortcut Input** (the original receipt image/PDF)
- Tap the "to" blank and build the new file name by inserting variables from the bar above the keyboard:
  - Tap `DatePrefix` → type `_` → tap `Vendor` → type `_$` → tap `Amount`
  - It should look like: **DatePrefix** \_ **Vendor** \_$ **Amount**
  - Example result: `2026-06-26_Costco_$45.23`

Add action: **Save File**. The UI reads:

> **Save** `Renamed Item` **to** `iCloud Drive`

- **Ask Where To Save:** OFF
- **Subpath:** tap the field and type `Receipts/` then tap `Year` from the variables bar, type `/` then tap `MonthFolder` from the variables bar, then type `/`
  - It should look like: `Receipts/` **Year** `/` **MonthFolder** `/`
- **Overwrite If File Exists:** ON

> This automatically creates the folder structure `Receipts/2026/06-June/` if it doesn't exist.

### Step 6: Log to Spreadsheet

**First, create the Numbers spreadsheet (do this once before running the shortcut):**

1. Open **Numbers** on your iPhone/iPad/Mac
2. Create a new blank spreadsheet
3. In Row 1, type these column headers: `Date` | `Vendor` | `Amount` | `Description` | `File Name`
4. Name the table **Expenses** (tap the table name at the top-left of the table to rename it)
5. Save the spreadsheet to **iCloud Drive** inside a folder called `Receipts`, named `Expense Tracker`
   - The full path should be: `iCloud Drive / Receipts / Expense Tracker.numbers`

**Now add the action in the shortcut:**

Add action: **Add to Numbers Spreadsheet**. The UI reads:

> **Add** `___` **Values** **+** **to the** `Top` **of** `Expenses` **in** `Expense Tracker` **in** `Receipts/Expense Tracker`

Here's how to fill in each part:

1. **The values area** (the first blank, before "Values"): this is where you add ALL the column values. You need to tap the **+** button to add each value one at a time, in the same order as your spreadsheet columns:
   - Tap **+** → select `DatePrefix` from the variables bar (this fills the Date column)
   - Tap **+** → select `Vendor` (this fills the Vendor column)
   - Tap **+** → select `Amount` (this fills the Amount column)
   - Tap **+** → select `Description` (this fills the Description column)
   - Tap **+** → then build the file name by tapping `DatePrefix`, typing `_`, tapping `Vendor`, typing `_$`, tapping `Amount` (this fills the File Name column)

2. **to the** → tap and choose **Bottom** (so new receipts get added below existing rows, not above)

3. **of** → should show **Expenses** (the table name). If not, tap it and select the Expenses table

4. **in** (first) → should show **Expense Tracker** (the spreadsheet name). Tap to browse and select it if needed

5. **in** (second) → should show **Receipts/Expense Tracker** (the iCloud Drive path). Tap to browse to the correct location

> **Important:** The values are added in order — the first value goes in column A (Date), second in column B (Vendor), etc. Make sure you add them with **+** in the same order as your spreadsheet headers.

### Step 7: Confirmation Notification

Add action: **Show Notification**
- Title: `Receipt Saved ✓`
- Body: `Vendor — $Amount — Description (MonthFolder)`

---

## Final Setup

1. Tap the shortcut name at the top → rename to **"Save Receipt"**
2. Tap the icon to choose a receipt or dollar sign icon
3. Go to **Shortcut Details** (ⓘ button):
   - Enable **"Show in Share Sheet"**
   - Input types: **Images, PDFs**
4. Done!

---

## Usage

### From any app:
1. View or screenshot a receipt
2. Tap the **Share** button (↑ icon)
3. Tap **"Save Receipt"** in the share sheet
4. Wait 2-3 seconds — Apple Intelligence reads and files it automatically
5. You'll get a notification confirming the save

### Via Siri:
- "Hey Siri, Save Receipt" → then select a photo from your library

### From the Camera:
1. Take a photo of a physical receipt
2. In the Photos app, tap Share → "Save Receipt"

---

## Folder Structure Created Automatically

```
iCloud Drive/
└── Receipts/
    ├── Expense Tracker.numbers (or expense_log.csv)
    ├── 2026/
    │   ├── 01-January/
    │   │   ├── 2026-01-15_Kroger_$87.43.jpg
    │   │   └── 2026-01-22_Shell_$45.00.jpg
    │   ├── 02-February/
    │   ├── ...
    │   └── 06-June/
    │       ├── 2026-06-20_Amazon_$129.99.png
    │       └── 2026-06-26_Costco_$45.23.jpg
    └── 2027/
        └── ...
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Extract Text" action not found | Update to iOS 18.1+. Search for "Recognize Text" as an alternative. |
| "Ask ChatGPT" not available | Enable ChatGPT in Settings → Apple Intelligence & Siri → ChatGPT. Or use the "Generate Text" Apple Intelligence action instead. |
| AI returns wrong format | Edit the prompt to be more specific. Add "Do not include any other text." |
| Amount is wrong | The AI picks the largest "total" on the receipt. If it's wrong, you can edit the Numbers row after. |
| Folder not created | iCloud Drive creates subfolders automatically via "Save File". Make sure iCloud Drive is enabled. |
| Numbers spreadsheet not found | Create it manually first at `iCloud Drive/Receipts/Expense Tracker.numbers` with a table named `Expenses`. |

## One-Time CSV Setup

If using Option B (CSV), create the header row first by running this one-time shortcut:

1. New Shortcut → Add action: **Text**
   - Content: `Date,Vendor,Amount,Description,File Name`
2. Add action: **Save File**
   - Path: `Receipts/expense_log.csv`
   - Service: iCloud Drive
3. Run once, then delete this shortcut
