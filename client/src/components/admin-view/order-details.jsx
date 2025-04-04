import { useState, useEffect } from "react";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "../ui/use-toast";
import QRCode from "qrcode"; // Import QRCode library
import { jsPDF } from "jspdf"; // Import jsPDF library

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [qrCodeUrl, setQrCodeUrl] = useState(""); // State to store the generated QR code URL

  useEffect(() => {
    // Generate the QR code whenever the order details change
    if (orderDetails?._id) {
      // Create a formatted string with both the order ID and total amount
      const orderInfo = `
        ORDER ID - ${orderDetails._id}
        ORDER DATE - ${orderDetails?.orderDate.split("T")[0]}
        TOTAL PAYABLE AMOUNT - ${(orderDetails?.totalAmount + orderDetails?.shippingCharges).toFixed(2)}
        PAYMENT STATUS - ${orderDetails?.paymentStatus}
        ORDER STATUS - ${orderDetails?.orderStatus}

        ITEMS:
        ${orderDetails?.cartItems?.map(item => `- TITLE: ${item.title}, QUANTITY: ${item.quantity}, PRICE: $${item.price}`).join("\n")}

        SHIPPING INFO:
        ADDRESS - ${orderDetails?.addressInfo?.address}
        PHONE - ${orderDetails?.addressInfo?.phone}
      `;
    
      // Generate the QR code with the formatted string containing both the order ID and total amount
      QRCode.toDataURL(orderInfo, { width: 150 }, (err, url) => {
        if (err) console.error(err);
        setQrCodeUrl(url); // Set the QR code URL in the state
      });
    }
  }, [orderDetails]);

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(16);
    doc.text("Order Details", 14, 20);

    // Order Information
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderDetails._id}`, 14, 30);
    doc.text(`Order Date: ${orderDetails?.orderDate.split("T")[0]}`, 14, 40);
    doc.text(`Total Amount: $${(orderDetails?.totalAmount + orderDetails?.shippingCharges).toFixed(2)}`, 14, 50);
    doc.text(`Payment Status: ${orderDetails?.paymentStatus}`, 14, 60);
    doc.text(`Order Status: ${orderDetails?.orderStatus}`, 14, 70);

    // Items Section
    doc.text("Items:", 14, 80);
    orderDetails?.cartItems?.forEach((item, index) => {
      doc.text(`Title: ${item.title}, Quantity: ${item.quantity}, Price: $${item.price}`, 14, 90 + (index * 10));
    });

    // Shipping Info Section
    doc.text("Shipping Info:", 14, 100 + (orderDetails?.cartItems?.length * 10));
    doc.text(`Address: ${orderDetails?.addressInfo?.address}`, 14, 110 + (orderDetails?.cartItems?.length * 10));
    doc.text(`Phone: ${orderDetails?.addressInfo?.phone}`, 14, 120 + (orderDetails?.cartItems?.length * 10));
    
    // QR Code Section
    if (qrCodeUrl) {
      doc.addImage(qrCodeUrl, "PNG", 14, 130 + (orderDetails?.cartItems?.length * 10), 50, 50);
    }

    // Save the PDF
    doc.save(`Order_${orderDetails._id}_Details.pdf`);
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      {/* Added scrollable class to DialogContent */}
      <div className="max-h-[80vh] overflow-y-auto p-4">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <div className="flex mt-6 items-center justify-between">
              <p className="font-medium">Order ID</p>
              <Label>{orderDetails?._id}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Order Date</p>
              <Label>{orderDetails?.orderDate.split("T")[0]}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Order Price</p>
              <Label>${orderDetails?.totalAmount}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Shipping charges</p>
              <Label>{orderDetails?.shippingCharges}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Total Payable Amount</p>
              <Label>{(orderDetails?.totalAmount + orderDetails?.shippingCharges).toFixed(2)}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Payment method</p>
              <Label>{orderDetails?.paymentMethod}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Payment Status</p>
              <Label>{orderDetails?.paymentStatus}</Label>
            </div>
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Order Status</p>
              <Label>
                <Badge
                  className={`py-1 px-3 ${
                    orderDetails?.orderStatus === "confirmed"
                      ? "bg-green-500"
                      : orderDetails?.orderStatus === "rejected"
                      ? "bg-red-600"
                      : "bg-black"
                  }`}
                >
                  {orderDetails?.orderStatus}
                </Badge>
              </Label>
            </div>
          </div>
          <Separator />

          {/* Scrollable Order Details Section */}
          <div className="overflow-y-auto max-h-[300px]">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="font-medium">Order Details</div>
                <ul className="grid gap-3">
                  {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                    ? orderDetails?.cartItems.map((item, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span>Title: {item.title}</span>
                          <span>Quantity: {item.quantity}</span>
                          <span>Price: ${item.price}</span>
                        </li>
                      ))
                    : null}
                </ul>
              </div>
            </div>
          </div>

          {/* Scrollable Shipping Info Section */}
          <div className="overflow-y-auto max-h-[300px] mt-4">
            <div className="grid gap-2">
              <div className="font-medium">Shipping Info</div>
              <div className="grid gap-0.5 text-muted-foreground">
                <span>{user.userName}</span>
                <span>{orderDetails?.addressInfo?.address}</span>
                <span>{orderDetails?.addressInfo?.city}</span>
                <span>{orderDetails?.addressInfo?.pincode}</span>
                <span>{orderDetails?.addressInfo?.phone}</span>
                <span>{orderDetails?.addressInfo?.notes}</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {qrCodeUrl && (
            <div className="mt-4">
              <p className="font-medium">Order QR Code</p>
              <img src={qrCodeUrl} alt="QR Code" />
            </div>
          )}

          {/* Download PDF Button with Centering and Faded Lines */}
          <div className="mt-4 flex justify-center items-center relative">
            {/* Faded line */}
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            </div>

            {/* Button with padding */}
            <button
              className="btn btn-primary relative z-10 px-6 py-2"
              onClick={handleDownloadPDF}
            >
              Download Invoice PDF
            </button>
          </div>


          <div>
            <CommonForm
              formControls={[{
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              }]}
              formData={formData}
              setFormData={setFormData}
              buttonText={"Update Order Status"}
              onSubmit={handleUpdateStatus}
            />
          </div>

        
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
