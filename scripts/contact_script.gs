// MentorBridge - Contact Messages Script
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Message ID', 'Submission Date', 'Name', 'Phone', 'I am a', 'Message', 'Status'
      ]);
      sheet.getRange(1, 1, 1, 7).setBackground('#0B1E36').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    var lastRow = sheet.getLastRow();
    var msgId = 'MSG' + String(lastRow).padStart(4, '0');
    
    sheet.appendRow([
      msgId,
      new Date().toLocaleString('en-IN'),
      data.name || '',
      data.phone || '',
      data.role || '',
      data.message || '',
      'Unread'
    ]);
    
    sheet.autoResizeColumns(1, 7);
    
    return ContentService
      .createTextOutput(JSON.stringify({status: 'success', id: msgId}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'MentorBridge Contact API Active'}))
    .setMimeType(ContentService.MimeType.JSON);
}
