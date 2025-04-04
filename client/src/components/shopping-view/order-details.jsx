import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { jsPDF } from "jspdf"; // Import jsPDF

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  // Function to handle the download of order details as a PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add Order ID, Date, and other details to the PDF
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderDetails?._id}`, 10, 10);
    doc.text(`Order Date: ${orderDetails?.orderDate.split("T")[0]}`, 10, 20);
    doc.text(`Order Price: ${orderDetails?.totalAmount}`, 10, 30);
    doc.text(`Shipping Charges: ${orderDetails?.shippingCharges}`, 10, 40);
    doc.text(`Total Payable Amount: ${(orderDetails?.totalAmount + orderDetails?.shippingCharges).toFixed(2)}`, 10, 50);
    doc.text(`Payment Method: ${orderDetails?.paymentMethod}`, 10, 60);
    doc.text(`Payment Status: ${orderDetails?.paymentStatus}`, 10, 70);
    doc.text(`Order Status: ${orderDetails?.orderStatus}`, 10, 80);
    
    // Add Order Details (Cart Items)
    doc.text("Order Details:", 10, 90);
    let y = 100;
    orderDetails?.cartItems.forEach((item) => {
      doc.text(`Title: ${item.title}`, 10, y);
      doc.text(`Quantity: ${item.quantity}`, 60, y);
      doc.text(`Price: ${item.price}`, 120, y);
      y += 10;
    });
    
    // Add Shipping Info
    doc.text("Shipping Info:", 10, y + 10);
    doc.text(`Name: ${user.userName}`, 10, y + 20);
    doc.text(`Address: ${orderDetails?.addressInfo?.address}`, 10, y + 30);
    doc.text(`City: ${orderDetails?.addressInfo?.city}`, 10, y + 40);
    doc.text(`Pincode: ${orderDetails?.addressInfo?.pincode}`, 10, y + 50);
    doc.text(`Phone: ${orderDetails?.addressInfo?.phone}`, 10, y + 60);
    doc.text(`Notes: ${orderDetails?.addressInfo?.notes}`, 10, y + 70);

    // Save the PDF with the order ID as the filename
    doc.save(`Order-${orderDetails?._id}.pdf`);
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
            <Label>{orderDetails?.totalAmount}</Label>
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

        {/* Scrollable section for Products/Order Details */}
        <div className="max-h-[300px] overflow-y-auto">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="font-medium">Order Details</div>
              <ul className="grid gap-3">
                {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                  ? orderDetails?.cartItems.map((item) => (
                      <li className="flex items-center justify-between">
                        <span>Title: {item.title}</span>
                        <span>Quantity: {item.quantity}</span>
                        <span>Price: {item.price}</span>
                      </li>
                    ))
                  : null}
              </ul>
            </div>
          </div>
        </div>

        {/* Shipping Info section (Outside of scrollable container) */}
        <div className="grid gap-4">
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

        {/* Download Button */}
        <div className="flex justify-end mt-4">
        <button
  onClick={handleDownloadPDF}
  className="px-4 py-2 bg-black text-white rounded-md"
>
  Download invoice as PDF
</button>

        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
