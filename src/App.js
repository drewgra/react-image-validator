import React, { useState } from 'react';
import ImageCaptureAndUpload from './ImageCaptureAndUpload';

function App() {
  const [canProceed, setCanProceed] = useState(false);

  // This callback is triggered after validation completes
  const handleValidationChange = (result) => {
    // If result is null, no validation done yet or reset
    if (!result) {
      setCanProceed(false);
      return;
    }
    // Update proceed permission based on validation result
    setCanProceed(result.success === true);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Image Upload/Capture Demo</h1>
      
      {/* Our custom module */}
      <ImageCaptureAndUpload onValidationChange={handleValidationChange} />

      {/* Feedback to user about progressing */}
      <div style={{ marginTop: '20px' }}>
        {canProceed
          ? <p style={{ color: 'green' }}>✅ You can now proceed to the next step.</p>
          : <p>Please validate an image before proceeding.</p>
        }
      </div>
    </div>
  );
}

export default App;
