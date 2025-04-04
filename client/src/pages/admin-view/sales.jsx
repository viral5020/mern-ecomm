import React, { useState } from 'react';
import { BarChart, Users, DollarSign, UserPlus, ShoppingCart } from 'lucide-react'; // Import Lucide Icons
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Registering the chart components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Function to generate random sales data
const generateRandomSalesData = (num) => {
  const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  const data = [];
  for (let i = 0; i < num; i++) {
    const product = products[i % products.length];
    data.push({
      id: i + 1,
      product,
      quantity: Math.floor(Math.random() * 200) + 50, // Random quantity sold between 50 and 250
      revenue: Math.floor(Math.random() * 5000) + 1000, // Random revenue between $1000 and $6000
    });
  }
  return data;
};

const Sales = () => {
  // Dynamic sales data generation
  const salesData = generateRandomSalesData(10); // Generating 10 sales data entries

  const recentOrdersData = [
    { trackingNumber: '12345', product: 'Product A', totalOrder: 5, status: 'Shipped', totalAmount: 150 },
    { trackingNumber: '67890', product: 'Product B', totalOrder: 3, status: 'Pending', totalAmount: 90 },
    { trackingNumber: '11223', product: 'Product C', totalOrder: 2, status: 'Shipped', totalAmount: 60 },
    { trackingNumber: '44556', product: 'Product D', totalOrder: 8, status: 'Pending', totalAmount: 240 },
    { trackingNumber: '78901', product: 'Product E', totalOrder: 4, status: 'Delivered', totalAmount: 120 },
    { trackingNumber: '23456', product: 'Product F', totalOrder: 6, status: 'Shipped', totalAmount: 180 },
    { trackingNumber: '34567', product: 'Product G', totalOrder: 7, status: 'Cancelled', totalAmount: 210 },
  ];

  // Recent Transactions data
  const recentTransactionsData = [
    { transactionId: 'TX123', date: '2025-03-21', amount: '$1500', status: 'Completed' },
    { transactionId: 'TX124', date: '2025-03-20', amount: '$1200', status: 'Pending' },
    { transactionId: 'TX125', date: '2025-03-19', amount: '$800', status: 'Failed' },
    { transactionId: 'TX126', date: '2025-03-18', amount: '$3000', status: 'Completed' },
    { transactionId: 'TX127', date: '2025-03-17', amount: '$2200', status: 'Completed' },
  ];

  // Chart.js data for sales
  const chartData = {
    labels: ['Week', 'Month', 'Year'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [12000, 40000, 150000], // Example data for weekly, monthly, yearly revenue
        backgroundColor: 'rgba(75, 192, 192, 0.5)', // Chart color
        borderColor: 'rgba(75, 192, 192, 1)', // Border color
        borderWidth: 1,
      },
    ],
  };

  // Cash In and Cash Out Data for side-by-side graph
  const cashInOutData = {
    labels: ['Week', 'Month', 'Year'],
    datasets: [
      {
        label: 'Cash In ($)',
        data: [8000, 25000, 100000], // Example data for cash in
        backgroundColor: 'rgba(53, 162, 235, 0.5)', // Blue for Cash In
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Cash Out ($)',
        data: [5000, 15000, 70000], // Example data for cash out
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Red for Cash Out
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Sales Revenue Overview',
        font: {
          size: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time Period',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Revenue ($)',
        },
      },
    },
  };

  const cashInOutOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Cash In & Cash Out Overview',
        font: {
          size: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time Period',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Amount ($)',
        },
      },
    },
  };

  const [sections, setSections] = useState([
    { id: 'box1', type: 'metrics' },
    { id: 'box2', type: 'cashInOut' },
    { id: 'box4', type: 'salesData' },
    { id: 'box5', type: 'recentOrdersAndTransactions' }, // Combined recent orders and transactions section
  ]);

  const handleDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;

    const reorderedSections = Array.from(sections);
    const [movedSection] = reorderedSections.splice(source.index, 1);
    reorderedSections.splice(destination.index, 0, movedSection);

    setSections(reorderedSections);
  };

  const renderSection = (section) => {
    switch (section.type) {
      case 'metrics':
        return (
          <div style={styles.boxContainer}>
            <div style={styles.box}>
              <DollarSign size={32} color="#4CAF50" />
              <div style={styles.boxTitle}>Today's Money</div>
              <div style={styles.boxValue}>$12,500</div>
            </div>
            <div style={styles.box}>
              <Users size={32} color="#4CAF50" />
              <div style={styles.boxTitle}>Today's Users</div>
              <div style={styles.boxValue}>150</div>
            </div>
            <div style={styles.box}>
              <UserPlus size={32} color="#4CAF50" />
              <div style={styles.boxTitle}>New Clients</div>
              <div style={styles.boxValue}>8</div>
            </div>
            <div style={styles.box}>
              <ShoppingCart size={32} color="#4CAF50" />
              <div style={styles.boxTitle}>Today's Sales</div>
              <div style={styles.boxValue}>25</div>
            </div>
          </div>
        );
      case 'cashInOut':
        return (
          <div style={styles.doubleChartBox}>
            <div style={styles.chartBox}>
              <Bar data={cashInOutData} options={cashInOutOptions} />
            </div>
            <div style={styles.chartBox}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        );
      case 'salesData':
        return (
          <div style={styles.salesContent}>
            <h2 style={styles.salesTitle}>Detailed Sales Data</h2>
            <table style={styles.salesTable}>
              <thead>
                <tr>
                  <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Product</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Quantity Sold</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale, index) => (
                  <tr key={sale.id} style={index % 2 === 0 ? { backgroundColor: '#f9f9f9' } : {}}>
                    <td style={styles.tableCell}>{sale.product}</td>
                    <td style={styles.tableCell}>{sale.quantity}</td>
                    <td style={styles.tableCell}>${sale.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'recentOrdersAndTransactions':
        return (
          <div style={styles.recentOrdersBox}>
            <div style={styles.tablesContainer}>
              <div style={styles.tableWrapper}>
                <h2 style={styles.recentOrdersTitle}>Recent Orders</h2>
                <table style={styles.recentOrdersTable}>
                  <thead>
                    <tr>
                      <th style={styles.recentOrdersHeader}>Tracking Number</th>
                      <th style={styles.recentOrdersHeader}>Product Name</th>
                      <th style={styles.recentOrdersHeader}>Total Order</th>
                      <th style={styles.recentOrdersHeader}>Status</th>
                      <th style={styles.recentOrdersHeader}>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrdersData.map((order, index) => (
                      <tr key={order.trackingNumber} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td style={styles.recentOrdersCell}>{order.trackingNumber}</td>
                        <td style={styles.recentOrdersCell}>{order.product}</td>
                        <td style={styles.recentOrdersCell}>{order.totalOrder}</td>
                        <td style={styles.recentOrdersCell}>
                          <span style={order.status === 'Shipped' ? styles.shippedStatus : styles.defaultStatus}>{order.status}</span>
                        </td>
                        <td style={styles.recentOrdersCell}>${order.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={styles.tableWrapper}>
                <h2 style={styles.recentOrdersTitle}>Recent Transactions</h2>
                <table style={styles.recentOrdersTable}>
                  <thead>
                    <tr>
                      <th style={styles.recentOrdersHeader}>Transaction ID</th>
                      <th style={styles.recentOrdersHeader}>Date</th>
                      <th style={styles.recentOrdersHeader}>Amount</th>
                      <th style={styles.recentOrdersHeader}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactionsData.map((transaction, index) => (
                      <tr key={transaction.transactionId} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td style={styles.recentOrdersCell}>{transaction.transactionId}</td>
                        <td style={styles.recentOrdersCell}>{transaction.date}</td>
                        <td style={styles.recentOrdersCell}>{transaction.amount}</td>
                        <td style={styles.recentOrdersCell}>
                          <span style={transaction.status === 'Completed' ? styles.shippedStatus : styles.defaultStatus}>{transaction.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" direction="vertical">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        ...styles.sectionContainer,
                      }}
                    >
                      {renderSection(section)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

// Styles for the sections, tables, and charts
const styles = {
  sectionContainer: {
    marginBottom: '20px',
  },
  boxContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    flex: 1,
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginRight: '10px',
  },
  boxTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  boxValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  doubleChartBox: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  chartBox: {
    width: '48%',
  },
  salesContent: {
    marginTop: '20px',
  },
  salesTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  salesTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  tableCell: {
    padding: '8px',
    border: '1px solid #ddd',
    textAlign: 'center',
  },
  tableHeader: {
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold',
  },
  recentOrdersBox: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  },
  tablesContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  tableWrapper: {
    width: '48%',
  },
  recentOrdersTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  recentOrdersTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  recentOrdersHeader: {
    padding: '10px',
    backgroundColor: '#f4f4f4',
    textAlign: 'left',
  },
  recentOrdersCell: {
    padding: '10px',
    textAlign: 'center',
    borderBottom: '1px solid #ddd',
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
  },
  evenRow: {
    backgroundColor: '#fff',
  },
  shippedStatus: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  defaultStatus: {
    color: '#f39c12',
  },
};

export default Sales;
