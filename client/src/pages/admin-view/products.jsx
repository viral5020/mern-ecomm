import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";

// Initial form data for the product and category
const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

const initialCategoryFormData = {
  name: "",
  image: null,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [openCreateCategoryDialog, setOpenCreateCategoryDialog] = useState(false); // For category form
  const [formData, setFormData] = useState(initialFormData);
  const [categoryFormData, setCategoryFormData] = useState(initialCategoryFormData); // For category form
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Handle the form submission for both adding and editing products
  function onSubmit(event) {
    event.preventDefault();
  
    // Handle both add and edit product actions
    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            // Send email notification when new product is successfully added
            sendEmailNotification({
              title: formData.title,
              description: formData.description,
              price: formData.price,
            });
  
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            setImageFile(null);
            setFormData(initialFormData);
  
            toast({
              title: "Product added successfully",
            });
          }
        });
  }

  // Handle product deletion
  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  // Check if the form is valid
  function isFormValid() {
    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview")
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  // Handle CSV file upload and process products from the file
  function handleCsvUpload(event) {
    const file = event.target.files[0];
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      // Get the first sheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      jsonData.forEach((product) => {
        dispatch(addNewProduct(product)).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            toast({
              title: "Products added from CSV",
            });
          }
        });
      });
    };
    reader.readAsBinaryString(file);
  }

  // Handle downloading the products as CSV
  function handleCsvDownload() {
    const worksheet = XLSX.utils.json_to_sheet(productList); // Convert products to CSV format
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    // Write the CSV to a file
    const csvOutput = XLSX.write(workbook, { bookType: "csv", type: "binary" });
    const blob = new Blob([csvOutput], { type: "application/octet-stream" });

    // Create a link and trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "products.csv";
    link.click();
  }

  // Fetch all products when component mounts
  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Function to send email notification about the new product
  function sendEmailNotification(product) {
    const emailData = {
      title: product.title,
      description: product.description,
      price: product.price,
    };

    fetch("http://localhost:5000/api/add-product-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Ensure the server knows you're sending JSON data
      },
      body: JSON.stringify(emailData), // Convert the JavaScript object into JSON string
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to send email: ${response.statusText}`);
        }
        return response.json(); // Parse the response as JSON
      })
      .then((data) => {
        console.log("Email sent successfully: ", data);
      })
      .catch((error) => {
        console.error("Error sending email: ", error);
      });
  }

  // Handle category form submission
  // Handle category form submission
function onCategorySubmit(event) {
  event.preventDefault();
  setOpenCreateCategoryDialog(false);

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
        toast({
          title: "Category created successfully",
        });
      } else {
        toast({
          title: "Error creating category",
          description: data.message || "Unknown error",
        });
      }
    })
    .catch((error) => {
      console.error("Error creating category:", error);
      toast({
        title: "Error creating category",
        description: error.message || "Unknown error",
      });
    });
} 

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end items-center">
        {/* Button for uploading CSV */}
        <Button onClick={() => document.getElementById("csv-upload").click()} className="pr-4">
          Upload CSV
        </Button>

        {/* Vertical Line */}
        <span className="mx-4 border-l border-gray-400 h-6"></span>

        {/* Button for downloading CSV */}
        <Button onClick={handleCsvDownload} className="px-4">
          Download CSV
        </Button>

        {/* Vertical Line */}
        <span className="mx-4 border-l border-gray-400 h-6"></span>

        {/* Button for creating category */}
        <Button onClick={() => setOpenCreateCategoryDialog(true)} className="px-4">
          Create Category
        </Button>

        {/* Vertical Line */}
        <span className="mx-4 border-l border-gray-400 h-6"></span>

        {/* Button for adding new product */}
        <Button onClick={() => setOpenCreateProductsDialog(true)} className="px-4">
          Add New Product
        </Button>

        {/* Hidden file input for CSV upload */}
        <input
          type="file"
          id="csv-upload"
          style={{ display: "none" }}
          accept=".csv"
          onChange={handleCsvUpload}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Render the list of products */}
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>

      {/* Dialog for creating or editing a product */}
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          {/* Product image upload */}
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            {/* Common form for adding/editing product */}
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog for creating category */}
      <Sheet
        open={openCreateCategoryDialog}
        onOpenChange={() => {
          setOpenCreateCategoryDialog(false);
          setCategoryFormData(initialCategoryFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Create New Category</SheetTitle>
          </SheetHeader>
          {/* Category image upload */}
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={false}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onCategorySubmit}
              formData={categoryFormData}
              setFormData={setCategoryFormData}
              buttonText="Add Category"
              formControls={[
                {
                  label: "Category Name",
                  name: "name",
                  type: "text",
                  value: categoryFormData.name,
                  onChange: (e) =>
                    setCategoryFormData({ ...categoryFormData, name: e.target.value }),
                },
              ]}
              isBtnDisabled={categoryFormData.name === ""} // Disable if no name
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
