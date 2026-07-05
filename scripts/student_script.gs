// MentorBridge - Student Enquiries Script
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Student ID', 'Submission Date', 'Student Name', 'Parent Name',
        'WhatsApp Number', 'Email', 'Class', 'Board',
        'Subjects', 'Teaching Mode', 'Timing', 'Medium',
        'Teacher Gender Pref', 'Address', 'Requirements', 'Status'
      ]);
      // Style header row
      sheet.getRange(1, 1, 1, 16).setBackground('#E8601A').setFontColor('#FFFFFF').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // Generate Student ID
    var lastRow = sheet.getLastRow();
    var studentId = 'STU' + String(lastRow).padStart(4, '0');
    
    // Append data
    sheet.appendRow([
      studentId,
      new Date().toLocaleString('en-IN'),
      data.studentName || '',
      data.parentName || '',
      data.phone || '',
      data.email || '',
      data.className || '',
      data.board || '',
      data.subjects || '',
      data.mode || '',
      data.timing || '',
      data.medium || '',
      data.teacherGender || 'No Preference',
      data.address || '',
      data.requirements || '',
      'New Enquiry'
    ]);
    
    // Auto resize columns
    sheet.autoResizeColumns(1, 16);
    
    return ContentService
      .createTextOutput(JSON.stringify({status: 'success', id: studentId}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'MentorBridge Student API Active'}))
    .setMimeType(ContentService.MimeType.JSON);
}
