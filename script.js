// Function to extract table from PDF and generate Excel file
function extractTable() {
  const fileInput = document.getElementById('pdfFileInput');
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const arrayBuffer = event.target.result;

    // Load the PDF using PDF.js
    pdfjsLib.getDocument(arrayBuffer).promise.then(function (pdf) {
      const numPages = pdf.numPages;
      const tableData = [];
      let payeeIdentifier = false;
      let appendingText = '';
      let pageData = [];
        pageData.push([])
        pageData[0].push('Date')
        pageData[0].push('Reference')
        pageData[0].push('Type')
        pageData[0].push('Debit')
        pageData[0].push('Credit')
      // Process each page
      for (let pageNumber = 2; pageNumber <= numPages; pageNumber++) {
        pdf.getPage(pageNumber).then(function (page) {
          // Extract text content from the page
          page.getTextContent().then(function (textContent) {
            // Extract table data from text content
            textContent.items.forEach(function (textItem) {
              let text = textItem.str;

              if (text.includes('Date') || text.includes('/2023') || text.includes('/2022')) {
                console.log(text)
                if(pageData){
                    tableData.push(...pageData);
                }
                if(!text.includes('Date')) {
                  pageData = [];
                  pageData.push([])
                }
                if(text.includes('/2023') || text.includes('/2022')) {
                // Start of the table, initialize the row data array
                  pageData[pageData.length - 1].push(text);
                }
              }  else {
                // Add cell data to the row data array
                text = text.replace(/\s/, "")
                if(text.includes('Rs')) {
                  payeeIdentifier = false;
                  pageData[pageData.length - 1].push(appendingText);
                  appendingText = '';
                }
                if(text && !payeeIdentifier && !text.includes('Payee') && !text.includes('Payment') && !text.includes('Unreconciled') && !text.includes('Reference') && !text.includes('Unreconciled') && !text.includes('Type') && !text.includes('Reconciliation')  && !text.includes('Status')  && !text.includes('Credit')  && !text.includes('Debit'))
                  pageData[pageData.length - 1].push(text);
                if(text.includes('Payee')) {
                  payeeIdentifier = true;
                  appendingText += text;
                }
              }
            });

          });
        });
      }
      setTimeout(function() {
          generateExcel(tableData);
      }, 6000);
    });
  };
              

  reader.readAsArrayBuffer(file);
}

// Function to generate Excel file from table data
function generateExcel(data) {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Table');

  // Generate Excel file binary data
  const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Create a Blob object for the Excel data
  const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Create a download link and trigger the download
  const downloadLink = document.createElement('a');
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = 'table.xlsx';
  downloadLink.click();
}
