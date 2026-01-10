# Google Apps Script Setup for Payment Proof Upload

## Step 1: Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the code with the script below
4. Save the project (e.g., "HanBuy Payment Proof Handler")

## Step 2: Add the Script Code

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const orderId = data.orderId;
    const orderNumber = data.orderNumber || 'N/A';
    const amount = data.amount || 'N/A';
    const paymentType = data.paymentType || 'full';
    const customerEmail = data.customerEmail || 'N/A';
    const customerName = data.customerName || 'N/A';
    const imageBase64 = data.imageBase64;
    const fileName = data.fileName || 'payment_proof.png';
    
    // Convert base64 to blob
    const imageBlob = Utilities.newBlob(
      Utilities.base64Decode(imageBase64.split(',')[1] || imageBase64),
      'image/png',
      fileName
    );
    
    // SELLER EMAIL - Replace with your seller email
    const sellerEmail = 'your-seller-email@gmail.com';
    
    // Create email subject
    const subject = `Payment Proof - Order ${orderNumber} - ${amount}`;
    
    // Create email body
    const body = `
Payment Proof Received

Order Details:
- Order ID: ${orderId}
- Order Number: ${orderNumber}
- Amount: ${amount}
- Payment Type: ${paymentType}
- Customer Email: ${customerEmail}
- Customer Name: ${customerName}

Please verify this payment proof and update the order status accordingly.
    `.trim();
    
    // Send email with attachment
    MailApp.sendEmail({
      to: sellerEmail,
      subject: subject,
      body: body,
      attachments: [imageBlob]
    });
    
    // Optional: Save to Google Drive
    // const folder = DriveApp.getFolderById('YOUR_FOLDER_ID');
    // folder.createFile(imageBlob);
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: 'Payment proof sent successfully' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('HanBuy Payment Proof Handler is running');
}
```

## Step 3: Deploy as Web App

1. Click "Deploy" > "New deployment"
2. Click the gear icon ⚙️ next to "Select type" and choose "Web app"
3. Set:
   - Description: "HanBuy Payment Proof Handler"
   - Execute as: "Me"
   - Who has access: "Anyone" (or "Anyone with Google account" for more security)
4. Click "Deploy"
5. Copy the Web App URL (you'll need this for the frontend)

## Step 4: Update Environment Variable

Add the Web App URL to your `.env.local` file:

```
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Step 5: Update Seller Email

In the Google Apps Script code, replace `'your-seller-email@gmail.com'` with your actual seller email address.

## Optional: Save to Google Drive

If you want to also save files to Google Drive:

1. Create a folder in Google Drive
2. Get the folder ID from the URL
3. Uncomment the DriveApp code in the script
4. Replace `'YOUR_FOLDER_ID'` with your folder ID
