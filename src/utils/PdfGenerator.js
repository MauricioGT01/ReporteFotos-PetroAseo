import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePdf = async (formData, photos, targetShift = null) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  // Use a fixed width, let height be auto so it captures everything
  container.style.width = '800px'; 
  container.style.backgroundColor = 'white';
  document.body.appendChild(container);

  try {
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Format date from YYYY-MM-DD to DD-MM-YYYY
    const dateParts = formData.date ? formData.date.split('-') : ['','',''];
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : formData.date;

    const getPhoto = (label) => photos.find(p => p.label === label) || { label, url: null };

    const actividadPrincipal = 'BARRIDO MANUAL AREAS DE CIRCULACIÓN, AREAS DE CIRCULACIÓN Y MANIOBRA INTERNA, ANDEN DE CARGA Y DESCARGA PABELLONES A, B, C, D. A1, A2, A3, A4, A5, A6, D1, D2, D3, B1, B3, B2, ZONA DE ALFALFA, ZONA DE SANEO, PLATAFORMA A, PISTAS Y VEREDAS, CALLES, AVENIDAS Y ESTACIONAMIENTOS, MAESTRANZA, NUEVA PLATAFORMA, PUERTAS DE ACCESO (1, 2, 3, 4, 5, 6, 7), AREA DE INFLUENCIA, PUESTOS NO UTILIZADOS Y AREAS NO CONSTRUIDAS, HAMBRE CERO.';
    
    const actividadActual = actividadPrincipal;

    const turnosHeaders = {
      1: { name: 'TURNO 1', hours: '06:00 hasta 14:00 horas', actividad: actividadActual },
      2: { name: 'TURNO 2', hours: '14:00 hasta 22:00 horas', actividad: actividadActual },
      3: { name: 'TURNO 3', hours: '22:00 hasta 6:00 horas', actividad: actividadActual }
    };

    const otrasActividades = 'OTRAS ACTIVIDADES LAVADO, RECOLECCION DE RESIDUOS Y SEGREGACION DE RESIDUOS SOLIDOS';

    // Determinar textos del encabezado según el contrato (Logo y Nombre de Consorcio siempre es Petrolimpio)
    let headerElaboradoPor = 'CONSORCIO PETRO LIMPIO';
    let headerLogo = '/logo-petrolimpio.png';

    const pagesConfig = [
      {
        header: turnosHeaders[1],
        rows: [
          [getPhoto('Foto 06:00:00'), getPhoto('Foto 07:00:00'), getPhoto('Foto 08:00:00')],
          [getPhoto('Foto 09:00:00'), getPhoto('Foto 10:00:00'), getPhoto('Foto 11:00:00')],
          [getPhoto('Foto 12:00:00'), getPhoto('Foto 13:00:00'), null]
        ]
      },
      {
        header: turnosHeaders[2],
        rows: [
          [getPhoto('Foto 14:00:00'), getPhoto('Foto 15:00:00'), getPhoto('Foto 16:00:00')],
          [getPhoto('Foto 17:00:00'), getPhoto('Foto 18:00:00'), getPhoto('Foto 19:00:00')],
          [getPhoto('Foto 20:00:00'), getPhoto('Foto 21:00:00'), null]
        ]
      },
      {
        header: turnosHeaders[3],
        rows: [
          [getPhoto('Foto 22:00:00'), getPhoto('Foto 23:00:00'), getPhoto('Foto 00:00:00')],
          [getPhoto('Foto 01:00:00'), getPhoto('Foto 02:00:00'), getPhoto('Foto 03:00:00')],
          [getPhoto('Foto 04:00:00'), getPhoto('Foto 05:00:00'), null]
        ]
      },
      {
        header: { name: null, hours: null, actividad: otrasActividades },
        rows: [
          [getPhoto('Foto de compactadora 1er Turno'), getPhoto('Foto de compactadora 2do Turno'), getPhoto('Foto de compactadora 3er Turno')],
          [getPhoto('Foto Barredora 1er Turno'), getPhoto('Foto Barredora 2do Turno'), getPhoto('Foto Fregadora 2do Turno')],
          [getPhoto('Limpieza de canaletas 1er turno'), getPhoto('Limpieza de canaletas 2do turno'), getPhoto('Foto del personal servicio de lavado 2do turno')]
        ]
      },
      {
        header: { name: null, hours: null, actividad: otrasActividades },
        rows: [
          [getPhoto('Foto de lavamanos 1er turno'), getPhoto('Foto de lavamanos 2do turno'), getPhoto('Foto de lavamanos 3er turno')],
          [getPhoto('foto de segregacion 1er turno'), getPhoto('foto de segregacion 2do turno'), getPhoto('foto de segregacion 3er turno')]
        ]
      }
    ];

    let filteredPagesConfig = pagesConfig;
    if (targetShift) {
      filteredPagesConfig = [pagesConfig[targetShift - 1]];
    }

    let isFirstPage = true;

    for (const page of filteredPagesConfig) {
      
      const headerRowTurno = page.header.name ? `
        <tr>
          <td style="border: 2px solid black; padding: 5px; font-weight: bold;">${page.header.name} :</td>
          <td colspan="3" style="border: 2px solid black; padding: 5px;">${page.header.hours}</td>
        </tr>
      ` : '';

      container.innerHTML = `
        <div style="padding: 10px; box-sizing: border-box; width: 100%; font-family: Arial, sans-serif; color: black; display: flex; flex-direction: column;">
          <table style="width: 100%; border-collapse: collapse; border: 2px solid black; font-size: 10px;">
            <tr>
              <td style="width: 15%; border: 2px solid black; text-align: center; padding: 5px;">
                <img src="${headerLogo}" style="max-width: 100%; max-height: 40px; object-fit: contain;" alt="Logo" />
              </td>
              <td colspan="3" style="width: 85%; border: 2px solid black; text-align: center; font-weight: bold; padding: 5px; font-size: 14px;">
                INFORME FOTOGRÁFICO<br/>Elaborado por: ${headerElaboradoPor}
              </td>
            </tr>
            <tr>
              <td style="border: 2px solid black; padding: 5px; font-weight: bold;">ACTIVIDAD:</td>
              <td colspan="3" style="border: 2px solid black; padding: 5px; text-transform: uppercase;">
                ${page.header.actividad}
              </td>
            </tr>
            <tr>
              <td style="border: 2px solid black; padding: 5px; font-weight: bold;">CLIENTE:</td>
              <td colspan="3" style="border: 2px solid black; padding: 5px;">EMPRESA MUNICIPAL DE MERCADOS S.A</td>
            </tr>
            <tr>
              <td style="border: 2px solid black; padding: 5px; font-weight: bold;">UBICACIÓN:</td>
              <td style="border: 2px solid black; padding: 5px;">GRAN MERCADO MAYORISTA DE LIMA</td>
              <td style="border: 2px solid black; padding: 5px; font-weight: bold; width: 10%;">FECHA:</td>
              <td style="border: 2px solid black; padding: 5px; width: 15%; text-align: center; font-size: 12px; font-weight: bold;">${formattedDate}</td>
            </tr>
            ${headerRowTurno}
          </table>

          <table style="width: 100%; flex: 1; border-collapse: collapse; border: 2px solid black; border-top: none; table-layout: fixed;">
              ${page.rows.map(row => `
                <tr style="height: 33.33%;">
                  ${row.map(photo => {
                    if (!photo) return `<td style="border: 2px solid black; height: 300px;"></td>`;
                    return `
                    <td style="border: 2px solid black; text-align: center; vertical-align: middle; padding: 5px; overflow: hidden; height: 300px;">
                      ${photo.url 
                        ? `<img src="${photo.url}" crossOrigin="anonymous" style="width: 98%; height: 300px; object-fit: fill; margin: 0 auto; display: block;" />`
                        : `<div style="font-weight: bold; font-size: 11px; height: 300px; display: flex; align-items: center; justify-content: center;">${photo.label}</div>`
                      }
                    </td>
                  `}).join('')}
                </tr>
              `).join('')}
            </table>
        </div>
      `;

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(container.children[0], { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      if (!isFirstPage) {
        doc.addPage();
      }
      
      const margin = 10;
      const pdfPageWidth = doc.internal.pageSize.getWidth();
      const pdfPageHeight = doc.internal.pageSize.getHeight();
      
      const maxPdfWidth = pdfPageWidth - (margin * 2);
      const maxPdfHeight = pdfPageHeight - (margin * 2);

      let finalPdfWidth = maxPdfWidth;
      let finalPdfHeight = (canvas.height * finalPdfWidth) / canvas.width;
      
      if (finalPdfHeight > maxPdfHeight) {
        const ratio = maxPdfHeight / finalPdfHeight;
        finalPdfHeight = maxPdfHeight;
        finalPdfWidth = finalPdfWidth * ratio;
      }
      
      const xOffset = margin + (maxPdfWidth - finalPdfWidth) / 2;
      
      doc.addImage(imgData, 'JPEG', xOffset, margin, finalPdfWidth, finalPdfHeight);
      isFirstPage = false;
    }

    const fileName = `${formData.supervisor || 'Supervisor'} - ${formData.contract || 'Contrato'} - ${formattedDate || 'Fecha'}${targetShift ? ` - Turno ${targetShift}` : ''}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Ocurrió un error al generar el PDF.');
  } finally {
    document.body.removeChild(container);
  }
};
