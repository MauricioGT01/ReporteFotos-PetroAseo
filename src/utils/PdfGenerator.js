import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePdf = async (formData, photos) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px'; 
  container.style.height = '1131px'; 
  container.style.backgroundColor = 'white';
  document.body.appendChild(container);

  try {
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Helper to find a photo by its exact label
    const getPhoto = (label) => photos.find(p => p.label === label) || { label, url: null };

    const turnosHeaders = {
      1: { name: 'TURNO 1', hours: '06:00 hasta 14:00 horas', actividad: 'BARRIDO MANUAL AREAS DE CIRCULACIÓN, AREAS DE CIRCULACIÓN Y MANIOBRA INTERNA, ANDEN DE CARGA Y DESCARGA PABELLONES A, B, C, D. A1, A2, A3, A4, A5, A6, D1, D2, D3, B1, B3, ZONA DE ALFALFA, ZONA DE SANEO, PLATAFORMA A, PISTAS Y VEREDAS, CALLES, AVENIDAS Y ESTACIONAMIENTOS, MAESTRANZA, NUEVA PLATAFORMA, PUERTAS DE ACCESO (1, 2, 3, 4, 5, 6, 7), AREA DE INFLUENCIA, PUESTOS NO UTILIZADOS Y AREAS NO CONSTRUIDAS, HAMBRE CERO.' },
      2: { name: 'TURNO 2', hours: '14:00 hasta 22:00 horas', actividad: 'BARRIDO MANUAL AREAS DE CIRCULACIÓN, AREAS DE CIRCULACIÓN Y MANIOBRA INTERNA, ANDEN DE CARGA Y DESCARGA PABELLONES A, B, C, D. A1, A2, A3, A4, A5, A6, D1, D2, D3, B1, B3, ZONA DE ALFALFA, ZONA DE SANEO, PLATAFORMA A, PISTAS Y VEREDAS, CALLES, AVENIDAS Y ESTACIONAMIENTOS, MAESTRANZA, NUEVA PLATAFORMA, PUERTAS DE ACCESO (1, 2, 3, 4, 5, 6, 7), AREA DE INFLUENCIA, PUESTOS NO UTILIZADOS Y AREAS NO CONSTRUIDAS, HAMBRE CERO.' },
      3: { name: 'TURNO 3', hours: '22:00 hasta 6:00 horas', actividad: 'BARRIDO MANUAL AREAS DE CIRCULACIÓN, AREAS DE CIRCULACIÓN Y MANIOBRA INTERNA, ANDEN DE CARGA Y DESCARGA PABELLONES A, B, C, D. A1, A2, A3, A4, A5, A6, D1, D2, D3, B1, B3, ZONA DE ALFALFA, ZONA DE SANEO, PLATAFORMA A, PISTAS Y VEREDAS, CALLES, AVENIDAS Y ESTACIONAMIENTOS, MAESTRANZA, NUEVA PLATAFORMA, PUERTAS DE ACCESO (1, 2, 3, 4, 5, 6, 7), AREA DE INFLUENCIA, PUESTOS NO UTILIZADOS Y AREAS NO CONSTRUIDAS, HAMBRE CERO.' }
    };
    
    const otrasActividades = 'OTRAS ACTIVIDADES LAVADO, RECOLECCION DE RESIDUOS Y SEGREGACION DE RESIDUOS SOLIDOS';

    const pagesConfig = [
      {
        // Hoja 1: Turno 1 horas
        header: turnosHeaders[1],
        rows: [
          [getPhoto('Foto 06:00:00'), getPhoto('Foto 07:00:00'), getPhoto('Foto 08:00:00')],
          [getPhoto('Foto 09:00:00'), getPhoto('Foto 10:00:00'), getPhoto('Foto 11:00:00')],
          [getPhoto('Foto 12:00:00'), getPhoto('Foto 13:00:00'), null]
        ]
      },
      {
        // Hoja 2: Turno 2 horas
        header: turnosHeaders[2],
        rows: [
          [getPhoto('Foto 14:00:00'), getPhoto('Foto 15:00:00'), getPhoto('Foto 16:00:00')],
          [getPhoto('Foto 17:00:00'), getPhoto('Foto 18:00:00'), getPhoto('Foto 19:00:00')],
          [getPhoto('Foto 20:00:00'), getPhoto('Foto 21:00:00'), null]
        ]
      },
      {
        // Hoja 3: Turno 3 horas
        header: turnosHeaders[3],
        rows: [
          [getPhoto('Foto 22:00:00'), getPhoto('Foto 23:00:00'), getPhoto('Foto 00:00:00')],
          [getPhoto('Foto 01:00:00'), getPhoto('Foto 02:00:00'), getPhoto('Foto 03:00:00')],
          [getPhoto('Foto 04:00:00'), getPhoto('Foto 05:00:00'), null]
        ]
      },
      {
        // Hoja 4: Otras actividades
        header: { name: null, hours: null, actividad: otrasActividades },
        rows: [
          [getPhoto('Foto de compactadora 1er Turno'), getPhoto('Foto de compactadora 2do Turno'), getPhoto('Foto de compactadora 3er Turno')],
          [getPhoto('Foto Barredora 1er Turno'), getPhoto('Foto Barredora 2do Turno'), getPhoto('Foto Fregadora 2do Turno')],
          [getPhoto('Limpieza de canaletas 1er turno'), getPhoto('Limpieza de canaletas 2do turno'), getPhoto('Foto del personal servicio de lavado 2do turno')]
        ]
      },
      {
        // Hoja 5: Otras actividades cont.
        header: { name: null, hours: null, actividad: otrasActividades },
        rows: [
          [getPhoto('Foto de lavamanos 1er turno'), getPhoto('Foto de lavamanos 2do turno'), getPhoto('Foto de lavamanos 3er turno')],
          [getPhoto('foto de segregacion 1er turno'), getPhoto('foto de segregacion 2do turno'), getPhoto('foto de segregacion 3er turno')],
          [null, null, null]
        ]
      }
    ];

    let isFirstPage = true;

    for (const page of pagesConfig) {
      
      const headerRowTurno = page.header.name ? `
        <tr>
          <td style="border: 1px solid black; padding: 5px; font-weight: bold;">${page.header.name} :</td>
          <td colspan="3" style="border: 1px solid black; padding: 5px;">${page.header.hours}</td>
        </tr>
      ` : '';

      container.innerHTML = `
        <div style="padding: 20px; box-sizing: border-box; width: 100%; height: 100%; font-family: Arial, sans-serif; color: black; display: flex; flex-direction: column;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 10px;">
            <tr>
              <td style="width: 15%; border: 1px solid black; text-align: center; padding: 5px;">
                <img src="/logo-petrolimpio.png" style="max-width: 100%; max-height: 40px; object-fit: contain;" alt="Petrolimpio" />
              </td>
              <td colspan="3" style="width: 85%; border: 1px solid black; text-align: center; font-weight: bold; padding: 5px;">
                INFORME FOTOGRÁFICO<br/>Elaborado por: CONSORCIO PETRO LIMPIO
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 5px; font-weight: bold;">ACTIVIDAD:</td>
              <td colspan="3" style="border: 1px solid black; padding: 5px; text-transform: uppercase;">
                ${page.header.actividad}
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 5px; font-weight: bold;">CLIENTE:</td>
              <td colspan="3" style="border: 1px solid black; padding: 5px;">EMPRESA MUNICIPAL DE MERCADOS S.A</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; padding: 5px; font-weight: bold;">UBICACIÓN:</td>
              <td style="border: 1px solid black; padding: 5px;">GRAN MERCADO MAYORISTA DE LIMA</td>
              <td style="border: 1px solid black; padding: 5px; font-weight: bold; width: 10%;">FECHA:</td>
              <td style="border: 1px solid black; padding: 5px; width: 15%; text-align: center;">${formData.date}</td>
            </tr>
            ${headerRowTurno}
          </table>

          <table style="width: 100%; flex: 1; border-collapse: collapse; border: 1px solid black; margin-top: -1px; table-layout: fixed;">
            ${page.rows.map(row => `
              <tr style="height: 33.33%;">
                ${row.map(photo => {
                  if (!photo) return `<td style="border: 1px solid black;"></td>`;
                  return `
                  <td style="border: 1px solid black; text-align: center; vertical-align: middle; padding: 5px; overflow: hidden;">
                    ${photo.url 
                      ? `<img src="${photo.url}" crossOrigin="anonymous" style="width: 98%; height: 300px; object-fit: fill; margin: 0 auto; display: block;" />`
                      : `<div style="font-weight: bold; font-size: 11px;">${photo.label}</div>`
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
      
      const margin = 20;
      const pdfPageWidth = doc.internal.pageSize.getWidth();
      const pdfPageHeight = doc.internal.pageSize.getHeight();
      
      const pdfWidth = pdfPageWidth - (margin * 2);
      let pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If it's still too tall for the page with margins, scale it down to fit the height
      const maxPdfHeight = pdfPageHeight - (margin * 2);
      if (pdfHeight > maxPdfHeight) {
        const ratio = maxPdfHeight / pdfHeight;
        pdfHeight = maxPdfHeight;
        // Optional: you could adjust width here too, but centering is better.
        // For now, let's let it scale uniformly.
      }
      
      doc.addImage(imgData, 'JPEG', margin, margin, pdfWidth, pdfHeight);
      isFirstPage = false;
    }

    const fileName = `${formData.supervisor || 'Supervisor'} - ${formData.contract || 'Contrato'} - ${formData.date || 'Fecha'}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Ocurrió un error al generar el PDF.');
  } finally {
    document.body.removeChild(container);
  }
};
