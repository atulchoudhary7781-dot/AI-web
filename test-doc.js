// Test to verify document data structure
const testMessage = {
  id: '123',
  role: 'user',
  content: '📎 test.pdf',
  timestamp: new Date(),
  fileName: 'test.pdf',
  fileType: 'application/pdf',
  fileSize: 102400
}

console.log('Test Message:', JSON.stringify(testMessage, null, 2))
console.log('Has fileName:', !!testMessage.fileName)
console.log('Has image:', !!testMessage.image)
console.log('Should show doc:', testMessage.fileName && !testMessage.image)
