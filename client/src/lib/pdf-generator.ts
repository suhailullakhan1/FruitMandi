// Professional PDF generation utility for FruitTrade Pro bills
export interface BillData {
  id: string;
  billNumber: string;
  merchant: {
    name: string;
    merchantCode: string;
    phone: string;
    address?: string;
  };
  items: Array<{
    fruit: {
      name: string;
      variety?: string;
    };
    weight: string;
    rate: string;
    amount: string;
  }>;
  subtotal: string;
  transportDeduction: string;
  commissionDeduction: string;
  otherDeduction: string;
  netAmount: string;
  status: string;
  customMessage?: string;
  dueDate: string;
  createdAt: string;
}

export const generateBillPDF = (billData: BillData) => {
  // Create a new window for the bill
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to download the bill');
    return;
  }

  const formattedDate = new Date(billData.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedDueDate = new Date(billData.dueDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
  });

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const totalDeductions = (
    parseFloat(billData.transportDeduction) +
    parseFloat(billData.commissionDeduction) +
    parseFloat(billData.otherDeduction)
  ).toFixed(2);

  // Calculate fruit aggregation
  const fruitAggregation = billData.items.reduce((acc, item) => {
    const fruitKey = item.fruit.name;
    if (!acc[fruitKey]) {
      acc[fruitKey] = {
        totalWeight: 0,
        varieties: []
      };
    }
    acc[fruitKey].totalWeight += parseFloat(item.weight);
    if (item.fruit.variety) {
      acc[fruitKey].varieties.push({
        variety: item.fruit.variety,
        weight: parseFloat(item.weight),
        rate: parseFloat(item.rate),
        amount: parseFloat(item.amount)
      });
    }
    return acc;
  }, {} as Record<string, { totalWeight: number; varieties: Array<{ variety: string; weight: number; rate: number; amount: number }> }>);

  const billHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bill ${billData.billNumber} - FruitTrade Pro</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .bill-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }
        
        .header {
          background: linear-gradient(135deg, #ea580c 0%, #16a34a 100%);
          color: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .company-name {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .company-tagline {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .bill-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .info-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #ea580c;
        }
        
        .info-title {
          font-size: 18px;
          font-weight: bold;
          color: #ea580c;
          margin-bottom: 15px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .info-label {
          font-weight: 600;
          color: #64748b;
        }
        
        .info-value {
          font-weight: 600;
          color: #1e293b;
        }
        
        .items-section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #ea580c;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th {
          background: #ea580c;
          color: white;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }
        
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .items-table tr:last-child td {
          border-bottom: none;
        }
        
        .items-table tr:nth-child(even) {
          background: #f8fafc;
        }
        
        .variety-badge {
          background: #16a34a;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .aggregation-section {
          background: #f0fdf4;
          border: 2px solid #16a34a;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .aggregation-title {
          color: #16a34a;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .aggregation-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #dcfce7;
        }
        
        .aggregation-item:last-child {
          border-bottom: none;
          font-weight: bold;
        }
        
        .totals-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
        }
        
        .total-label {
          font-weight: 600;
          color: #64748b;
        }
        
        .total-value {
          font-weight: 600;
          color: #1e293b;
        }
        
        .deduction-row {
          color: #dc2626;
        }
        
        .final-total {
          border-top: 2px solid #ea580c;
          padding-top: 15px;
          font-size: 18px;
          font-weight: bold;
          color: #16a34a;
        }
        
        .custom-message {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .message-title {
          font-weight: bold;
          color: #92400e;
          margin-bottom: 8px;
        }
        
        .message-text {
          color: #78350f;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status-completed {
          background: #dcfce7;
          color: #166534;
        }
        
        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .bill-container {
            max-width: none;
            margin: 0;
            padding: 15px;
          }
          
          .header {
            break-inside: avoid;
          }
          
          .items-table {
            break-inside: avoid;
          }
          
          .totals-section {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="bill-container">
        <!-- Header -->
        <div class="header">
          <div class="company-name">FruitTrade Pro</div>
          <div class="company-tagline">Professional Fruit Trading Management</div>
        </div>
        
        <!-- Bill Information -->
        <div class="bill-info">
          <div class="info-section">
            <div class="info-title">Bill Details</div>
            <div class="info-item">
              <span class="info-label">Bill Number:</span>
              <span class="info-value">${billData.billNumber}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date:</span>
              <span class="info-value">${formattedDate}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Due Date:</span>
              <span class="info-value">${formattedDueDate}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="status-badge status-${billData.status}">${billData.status.toUpperCase()}</span>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-title">Merchant Details</div>
            <div class="info-item">
              <span class="info-label">Name:</span>
              <span class="info-value">${billData.merchant.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Code:</span>
              <span class="info-value">${billData.merchant.merchantCode}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone:</span>
              <span class="info-value">${billData.merchant.phone}</span>
            </div>
            ${billData.merchant.address ? `
            <div class="info-item">
              <span class="info-label">Address:</span>
              <span class="info-value">${billData.merchant.address}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Fruit Aggregation Summary -->
        <div class="aggregation-section">
          <div class="aggregation-title">Fruit Summary by Category</div>
          ${Object.entries(fruitAggregation).map(([fruitName, data]) => `
            <div class="aggregation-item">
              <span><strong>${fruitName}:</strong></span>
              <span><strong>${data.totalWeight.toFixed(3)} kg</strong></span>
            </div>
            ${data.varieties.map(variety => `
              <div class="aggregation-item" style="margin-left: 20px; font-size: 14px;">
                <span>└ ${variety.variety}: ${variety.weight.toFixed(3)} kg × ${formatCurrency(variety.rate.toString())}</span>
                <span>${formatCurrency(variety.amount.toString())}</span>
              </div>
            `).join('')}
          `).join('')}
        </div>
        
        <!-- Itemized Details -->
        <div class="items-section">
          <div class="section-title">Itemized Details</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Fruit</th>
                <th>Weight (kg)</th>
                <th>Rate (₹/kg)</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${billData.items.map(item => `
                <tr>
                  <td>
                    <div>
                      <strong>${item.fruit.name}</strong>
                      ${item.fruit.variety ? `<br><span class="variety-badge">${item.fruit.variety}</span>` : ''}
                    </div>
                  </td>
                  <td>${parseFloat(item.weight).toFixed(3)}</td>
                  <td>${formatCurrency(item.rate)}</td>
                  <td><strong>${formatCurrency(item.amount)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Totals Section -->
        <div class="totals-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">${formatCurrency(billData.subtotal)}</span>
          </div>
          
          ${parseFloat(billData.transportDeduction) > 0 ? `
          <div class="total-row deduction-row">
            <span class="total-label">Transport Deduction:</span>
            <span class="total-value">- ${formatCurrency(billData.transportDeduction)}</span>
          </div>
          ` : ''}
          
          ${parseFloat(billData.commissionDeduction) > 0 ? `
          <div class="total-row deduction-row">
            <span class="total-label">Commission Deduction:</span>
            <span class="total-value">- ${formatCurrency(billData.commissionDeduction)}</span>
          </div>
          ` : ''}
          
          ${parseFloat(billData.otherDeduction) > 0 ? `
          <div class="total-row deduction-row">
            <span class="total-label">Other Deduction:</span>
            <span class="total-value">- ${formatCurrency(billData.otherDeduction)}</span>
          </div>
          ` : ''}
          
          ${parseFloat(totalDeductions) > 0 ? `
          <div class="total-row">
            <span class="total-label">Total Deductions:</span>
            <span class="total-value deduction-row">- ${formatCurrency(totalDeductions)}</span>
          </div>
          ` : ''}
          
          <div class="total-row final-total">
            <span class="total-label">Net Amount:</span>
            <span class="total-value">${formatCurrency(billData.netAmount)}</span>
          </div>
        </div>
        
        <!-- Custom Message -->
        ${billData.customMessage ? `
        <div class="custom-message">
          <div class="message-title">Special Instructions</div>
          <div class="message-text">${billData.customMessage}</div>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${new Date().toLocaleString('en-IN')} by FruitTrade Pro</p>
        </div>
      </div>
      
      <script>
        // Auto-print on load
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(billHTML);
  printWindow.document.close();
  
  // Focus the print window
  printWindow.focus();
};

// Download as PDF function (requires browser support)
export const downloadBillAsPDF = async (billData: BillData) => {
  try {
    // For modern browsers, we can use the print to PDF functionality
    generateBillPDF(billData);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try the print option instead.');
  }
};