import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
  onSelect, // Function to handle selection
}) {
  const isSelected = selectedId?._id === addressInfo?._id;

  return (
    <Card
      onClick={() => {
        if (onSelect) {
          onSelect(addressInfo); // Call the selection handler
        }
        if (setCurrentSelectedAddress) {
          setCurrentSelectedAddress(addressInfo);
        }
      }}
      className={`cursor-pointer border-red-700 ${
        isSelected ? "border-red-900 border-[4px]" : "border-black"
      }`}
    >
      <CardContent className="grid p-4 gap-4">
        <Label>Address: {addressInfo?.address}</Label>
        <Label>City: {addressInfo?.city}</Label>
        <Label>Pincode: {addressInfo?.pincode}</Label>
        <Label>Phone: {addressInfo?.phone}</Label>
        <Label>Notes: {addressInfo?.notes}</Label>
        <Label>
  Address Type:{" "}
  <span
    className={
      addressInfo?.addressType === "shipping" 
        ? "text-green-500"  // Green for Shipping Address
        : "text-blue-500"   // Blue for Billing Address
    }
  >
    {addressInfo?.addressType === "shipping" ? "Shipping Address" : "Billing Address"}
  </span>
</Label>

 
      </CardContent>
      <CardFooter className="p-3 flex justify-between">
        <Button onClick={(e) => { e.stopPropagation(); handleEditAddress(addressInfo); }}>Edit</Button>
        <Button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addressInfo); }}>Delete</Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;