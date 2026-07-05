// MentorBridge - Teacher Applications Script
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Teacher ID', 'Submission Date', 'Full Name', 'WhatsApp Number', 
        'Email', 'City', 'Qualification', 'Experience', 
        'Subjects', 'Classes', 'Board', 'Teaching Mode', 
        'Medium', 'Introduction', 'Status'
      ]);
      // Style header row
      sheet.getRange(1, 1, 1, 15).setBackground('#1D7A6B').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // Generate Teacher ID
    var lastRow = sheet.getLastRow();
    var teacherId = 'TCH' + String(lastRow).padStart(4, '0');
    
    // Append data
    sheet.appendRow([
      teacherId,
      new Date().toLocaleString('en-IN'),
      data.name || '',
      data.phone || '',
      data.email || '',
      data.city || '',
      data.qualification || '',
      data.experience || '',
      data.subjects || '',
      data.classes || '',
      data.board || '',
      data.mode || '',
      data.medium || '',
      data.introduction || '',
      'New Application'
    ]);
    
    // Auto resize columns
    sheet.autoResizeColumns(1, 15);
    
    return ContentService
      .createTextOutput(JSON.stringify({status: 'success', id: teacherId}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'MentorBridge Teacher API Active'}))
    .setMimeType(ContentService.MimeType.JSON);
}
