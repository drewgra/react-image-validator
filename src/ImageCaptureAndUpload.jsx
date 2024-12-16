import React, { useState, useRef, useEffect } from 'react';

function ImageCaptureAndUpload({ onValidationChange }) {
  const [stage, setStage] = useState('initial'); 
  // possible stages: 'initial', 'preview', 'validating'
  
  const [imageData, setImageData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleUploadClick = () => {
    // Trigger file input dialog
    document.getElementById('fileInput').click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result);
      setStage('preview');
    };
    reader.readAsDataURL(file);
  };

  const handleCaptureClick = async () => {
    try {
      setShowCamera(true);
      // Request camera access with front-facing camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      videoRef.current.play();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setShowCamera(false);
    }
  };

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setImageData(dataUrl);
    setShowCamera(false);
    setStage('preview');
    // Stop the camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleValidateClick = async () => {
    if (!imageData) return;
    setStage('validating');

    try {
      // Example: sending image to API
      // Replace the URL with your actual endpoint and payload as needed.
      const response = await fetch('https://example.com/validate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData })
      });

      const result = await response.json();
      setValidationResult(result);
      // Pass the validation result up so the parent can use it
      if (onValidationChange) onValidationChange(result);

      // After validation, we remain in 'preview' to allow Clear or another attempt
      setStage('preview');
    } catch (error) {
      console.error('Validation error:', error);
      const failResult = { success: false, message: 'Error during validation.' };
      setValidationResult(failResult);
      if (onValidationChange) onValidationChange(failResult);
      setStage('preview');
    }
  };

  const handleClearClick = () => {
    setImageData(null);
    setValidationResult(null);
    setStage('initial');
    if (onValidationChange) onValidationChange(null);
    // Stop camera if still running
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div>
      {/* Hidden file input for uploading images */}
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Initial stage: show 2 buttons (Upload / Capture) */}
      {stage === 'initial' && !showCamera && (
        <div>
          <button onClick={handleUploadClick}>Upload</button>
          <button onClick={handleCaptureClick}>Capture</button>
        </div>
      )}

      {/* Camera view: show video and take/cancel buttons */}
      {showCamera && (
        <div>
          <video ref={videoRef} style={{ width: '300px' }} />
          <div>
            <button onClick={handleTakePhoto}>Take Photo</button>
            <button onClick={handleClearClick}>Cancel</button>
          </div>
        </div>
      )}

      {/* Preview: show the image and Validate/Clear buttons */}
      {stage !== 'initial' && !showCamera && imageData && (
        <div>
          <img
            src={imageData}
            alt="Selected"
            style={{ maxWidth: '300px', display: 'block', marginBottom: '1em' }}
          />
          
          {/* Show validation result if available */}
          {validationResult && (
            <div
              style={{ marginBottom: '1em', color: validationResult.success ? 'green' : 'red' }}
            >
              {validationResult.success
                ? 'Image is valid!'
                : `Validation failed: ${validationResult.message || 'Unknown reason'}`}
            </div>
          )}

          {/* Validate and Clear buttons */}
          {stage !== 'validating' && (
            <div>
              <button onClick={handleValidateClick}>Validate</button>
              <button onClick={handleClearClick}>Clear</button>
            </div>
          )}

          {/* Loading indicator */}
          {stage === 'validating' && (
            <div>Validating...</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageCaptureAndUpload;
