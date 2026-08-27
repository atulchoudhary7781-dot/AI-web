// Test the actual rendering condition

const testCases = [
  {
    name: 'PDF with fileName',
    message: {
      id: '1',
      role: 'user',
      content: '📎 test.pdf',
      timestamp: new Date(),
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      fileSize: 102400
    }
  },
  {
    name: 'DOC with only content',
    message: {
      id: '2', 
      role: 'user',
      content: '📎 report.docx',
      timestamp: new Date()
    }
  },
  {
    name: 'Image (should NOT show doc)',
    message: {
      id: '3',
      role: 'user', 
      content: 'Photo',
      timestamp: new Date(),
      image: 'base64data...',
      imageMimeType: 'image/png'
    }
  },
  {
    name: 'Empty message',
    message: {
      id: '4',
      role: 'user',
      content: 'Hello',
      timestamp: new Date()
    }
  }
]

console.log('=== TESTING DOCUMENT DISPLAY CONDITIONS ===\n')

testCases.forEach(({name, message}) => {
  const hasFileName = !!message.fileName
  const hasAttachmentInContent = message.content?.includes('📎')
  const hasImage = !!message.image
  
  // This is the actual condition from FullScreenChat.tsx
  const shouldShow = (message.fileName || (message.content && message.content.includes('📎'))) && !message.image
  
  console.log(`Test: ${name}`)
  console.log(`  - fileName: ${hasFileName}`)
  console.log(`  - content has 📎: ${hasAttachmentInContent}`)
  console.log(`  - hasImage: ${hasImage}`)
  console.log(`  - WILL SHOW DOCUMENT: ${shouldShow ? '✅ YES' : '❌ NO'}`)
  console.log('')
})
