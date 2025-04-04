import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast"; // Importing the toast notification for error handling
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ProductImageUpload from "@/components/admin-view/image-upload"; // Assuming this component handles image upload

const initialCategoryFormData = {
  name: "",
  image: null,
};

function Category() {
  const [categories, setCategories] = useState([]);
  const [openCreateCategoryDialog, setOpenCreateCategoryDialog] = useState(false); // Modal visibility
  const [categoryFormData, setCategoryFormData] = useState(initialCategoryFormData); // For category form
  const [uploadedImageUrl, setUploadedImageUrl] = useState(""); // Store uploaded image URL
  const { toast } = useToast();

  // Fetch categories on component mount
  useEffect(() => {
    async function getCategories() {
      try {
        const response = await fetch("http://localhost:5000/api/categories"); // Direct API call here
        const data = await response.json();

        if (response.ok) {
          setCategories(data.categories); // Set fetched categories to state
        } else {
          throw new Error(data.message || "Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error fetching categories",
          description: error.message || "An error occurred while fetching categories",
          variant: "destructive",
        });
      }
    }

    getCategories();
  }, []); // Empty dependency array to run the effect only once when the component mounts

  // Handle category form submission
  function onCategorySubmit(event) {
    event.preventDefault();

    // Include the uploaded image URL in the category data
    const categoryData = {
      ...categoryFormData,
      image: uploadedImageUrl, // Add the uploaded image URL here
    };

    // Send the category data to the server
    fetch("http://localhost:5000/api/categories/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData), // Send the category data with image URL
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setOpenCreateCategoryDialog(false);
          setCategoryFormData(initialCategoryFormData);
          setUploadedImageUrl(""); // Clear image URL after successful category creation
          toast({
            title: "Category created successfully",
          });
          // Optionally refetch categories to show the new one
          getCategories();
        } else {
          toast({
            title: "Error creating category",
            description: data.message || "Unknown error",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Error creating category:", error);
        toast({
          title: "Error creating category",
          description: error.message || "Unknown error",
          variant: "destructive",
        });
      });
  }

  return (
    <div className="mb-5 w-full flex flex-col items-center">
      {/* Button to trigger category creation */}
      <div className="w-full flex justify-end mb-4">
        
      </div>

      {/* Display categories directly in a grid format with images and names */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 w-full">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category._id} className="card p-4 border shadow-md rounded-md text-center">
              {/* Category image */}
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-48 object-cover rounded-md mb-3" 
              />
              {/* Category name */}
              <h3 className="font-semibold text-lg">{category.name}</h3>
            </div>
          ))
        ) : (
          <p>No categories available.</p>
        )}
      </div>

      {/* Dialog for creating a new category */}
      <Sheet
        open={openCreateCategoryDialog}
        onOpenChange={() => setOpenCreateCategoryDialog(false)} // Close dialog on change
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Create New Category</SheetTitle>
          </SheetHeader>

          {/* Category image upload */}
          <ProductImageUpload
            imageFile={null} // No initial image file
            setImageFile={() => {}} // No need to set image file here
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={() => {}}
            imageLoadingState={false}
            isEditMode={false} // This is for category creation, not editing
          />

          {/* Category form */}
          <div className="py-6">
            <form onSubmit={onCategorySubmit}>
              <div className="mb-4">
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, name: e.target.value })
                  }
                  required
                  className="mt-2 p-2 border border-gray-300 rounded-md w-full"
                  placeholder="Enter category name"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={!categoryFormData.name || !uploadedImageUrl}>
                  Add Category
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default Category;
