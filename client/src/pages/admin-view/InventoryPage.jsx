import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Avatar } from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedProducts, setEditedProducts] = useState({}); // For tracking stock edits only

  // Fetch products, orders, and customers from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await fetch("http://localhost:5000/api/admin/products/get");
        const productData = await productResponse.json();
        if (Array.isArray(productData.data)) {
          setProducts(productData.data);  // Save the products in state
        }

        const orderResponse = await fetch("http://localhost:5000/api/admin/orders/get");
        const orderData = await orderResponse.json();
        if (Array.isArray(orderData.data)) {
          setOrders(orderData.data);  // Save the orders in state
        }

        const customerResponse = await fetch("http://localhost:5000/api/admin/customers/get");
        const customerData = await customerResponse.json();
        if (Array.isArray(customerData.data)) {
          setCustomers(customerData.data);  // Save the customers in state
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle stock changes (increase or decrease)
  const handleStockChange = (id, stockChange) => {
    setEditedProducts((prev) => {
      const currentStock = prev[id]?.totalStock || products.find((product) => product._id === id)?.totalStock || 0;
      // Prevent stock from going negative, and only change if it's valid
      if (currentStock + stockChange >= 0) {
        return {
          ...prev,
          [id]: {
            ...prev[id],
            totalStock: currentStock + stockChange,
          },
        };
      }
      return prev; // Do nothing if stock would go negative
    });
  };

  // Update the product's stock in the backend
  const updateProduct = async (id) => {
    const productData = editedProducts[id] || {};

    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalStock: productData.totalStock || 0, // Update only stock
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      const updatedProduct = await response.json();

      // Update the product list in state after successful update
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product, totalStock: updatedProduct.data.totalStock } : product
        )
      );

      // Clear edited state for that product
      setEditedProducts((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#fafafa' }}>
      {/* Dashboard Overview */}
      <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Total Products Box */}
        <Paper sx={{ flex: 1, padding: '20px', backgroundColor: '#e3f2fd', boxShadow: 3, borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>Total Products</Typography>
          <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>{products.length}</Typography>
        </Paper>

        {/* Total Orders Box */}
        <Paper sx={{ flex: 1, padding: '20px', backgroundColor: '#fff3e0', boxShadow: 3, borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>Total Orders</Typography>
          <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>{orders.length}</Typography>
        </Paper>

        {/* Total Customers Box */}
        <Paper sx={{ flex: 1, padding: '20px', backgroundColor: '#c8e6c9', boxShadow: 3, borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ color: '#388e3c', fontWeight: 'bold' }}>Total Customers</Typography>
          <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>{customers.length}</Typography>
        </Paper>
      </Box>

      <Paper sx={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: 3 }}>
        <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: '', color: '#333' }}>
          Inventory
        </Typography>

        {/* Product Table */}
        <TableContainer component={Paper} sx={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Brand</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product._id}>
                    {/* Product Title */}
                    <TableCell>{product.title}</TableCell>

                    {/* Product Image */}
                    <TableCell>
                      <Avatar src={product.image} alt={product.title} sx={{ width: 50, height: 50 }} />
                    </TableCell>

                    {/* Product Category */}
                    <TableCell>{product.category}</TableCell>

                    {/* Product Brand */}
                    <TableCell>{product.brand}</TableCell>

                    {/* Product Stock */}
                    <TableCell>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {editedProducts[product._id]?.totalStock || product.totalStock}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleStockChange(product._id, 1)} // Increase stock
                          sx={{
                            background: 'linear-gradient(145deg, #6fbf73, #81c784)', // Glass-like gradient
                            color: '#fff', // White text color
                            padding: '12px 24px', // Increased padding
                            borderRadius: '12px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
                            backdropFilter: 'blur(6px)', // Glass effect
                            border: '1px solid rgba(255, 255, 255, 0.3)', // Subtle border
                            '&:hover': {
                              background: 'linear-gradient(145deg, #81c784, #6fbf73)', // Reverse gradient on hover
                              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                            },
                          }}
                        >
                          <KeyboardArrowUp /> Stock In
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleStockChange(product._id, -1)} // Decrease stock
                          disabled={editedProducts[product._id]?.totalStock <= 0} // Disable if stock is 0
                          sx={{
                            background: 'linear-gradient(145deg, #e57373, #d32f2f)', // Glass-like gradient
                            color: '#fff', // White text color
                            padding: '12px 24px', // Increased padding
                            borderRadius: '12px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
                            backdropFilter: 'blur(6px)', // Glass effect
                            border: '1px solid rgba(255, 255, 255, 0.3)', // Subtle border
                            '&:hover': {
                              background: 'linear-gradient(145deg, #d32f2f, #e57373)', // Reverse gradient on hover
                              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                            },
                          }}
                        >
                          <KeyboardArrowDown /> Stock Out
                        </Button>
                      </Box>
                    </TableCell>

                    {/* Actions Column - Update Button */}
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => updateProduct(product._id)}
                        sx={{
                          background: 'linear-gradient(145deg,rgb(0, 0, 0),rgb(0, 0, 0))', // Glass-like gradient
                          color: '#fff', // White text color
                          padding: '12px 24px', // Increased padding for a larger button
                          borderRadius: '12px', // Rounded corners
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
                          backdropFilter: 'blur(6px)', // Glass effect
                          border: '1px solid rgba(255, 255, 255, 0.3)', // Subtle border
                          textTransform: 'none', // Disable text transformation
                          '&:hover': {
                            background: 'linear-gradient(145deg,rgb(33, 33, 33),rgb(71, 78, 71))', // Reverse gradient on hover
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)', // Stronger shadow on hover
                          },
                        }}
                      >
                        Update Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No products available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default InventoryPage;
