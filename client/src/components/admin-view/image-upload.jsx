import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
}) {
  const [subImageFiles, setSubImageFiles] = useState([]);
  const inputRef = useRef(null);

  function handleMainImageFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setImageFile(selectedFile);
  }

  function handleSubImageFileChange(event) {
    const files = Array.from(event.target.files);
    if (subImageFiles.length + files.length <= 4) {
      setSubImageFiles([...subImageFiles, ...files]);
    } else {
      alert("You can upload a maximum of 4 sub-images.");
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  }

  function handleRemoveImage() {
    setImageFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleRemoveSubImage(index) {
    setSubImageFiles(subImageFiles.filter((_, i) => i !== index));
  }

  async function uploadImageToCloudinary(file) {
    setImageLoadingState(true);
    const data = new FormData();
    data.append("my_file", file);
    const response = await axios.post(
      "http://localhost:5000/api/admin/products/upload-image",
      data
    );

    if (response?.data?.success) {
      setUploadedImageUrl(response.data.result.url);
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null) uploadImageToCloudinary(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (subImageFiles.length > 0) {
      subImageFiles.forEach((file) => uploadImageToCloudinary(file));
    }
  }, [subImageFiles]);

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      {/* Main Image Upload */}
      <Label className="text-lg font-semibold mb-2 block">Main Image</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${
          isEditMode ? "opacity-60" : ""
        } border-2 border-dashed rounded-lg p-4`}
      >
        <Input
          id="main-image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleMainImageFileChange}
          disabled={isEditMode}
        />
        {!imageFile ? (
          <Label
            htmlFor="main-image-upload"
            className={`${
              isEditMode ? "cursor-not-allowed" : ""
            } flex flex-col items-center justify-center h-32 cursor-pointer`}
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>Drag & drop or click to upload main image</span>
          </Label>
        ) : imageLoadingState ? (
          <Skeleton className="h-10 bg-gray-100" />
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileIcon className="w-8 text-primary mr-2 h-8" />
            </div>
            <p className="text-sm font-medium">{imageFile.name}</p>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleRemoveImage}
            >
              <XIcon className="w-4 h-4" />
              <span className="sr-only">Remove File</span>
            </Button>
          </div>
        )}
      </div>

      {/* Sub Image Upload */}
      <Label className="text-lg font-semibold mt-6 mb-2 block">Upload Sub Images</Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 ${isEditMode ? "opacity-60" : ""}`}
      >
        <Input
          id="sub-images-upload"
          type="file"
          className="hidden"
          multiple
          onChange={handleSubImageFileChange}
          disabled={isEditMode}
        />
        <div className="flex flex-wrap gap-4">
          {subImageFiles.map((file, index) => (
            <div key={index} className="relative w-24 h-24 border-2 border-dashed rounded-lg">
              <img
                src={URL.createObjectURL(file)}
                alt={`Sub Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 text-red-600"
                onClick={() => handleRemoveSubImage(index)}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {subImageFiles.length < 4 && (
            <Label
              htmlFor="sub-images-upload"
              className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer"
            >
              <UploadCloudIcon className="w-8 h-8 text-muted-foreground mb-2" />
              <span>+</span>
            </Label>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductImageUpload;
