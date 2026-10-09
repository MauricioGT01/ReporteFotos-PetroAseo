import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('Iniciando limpieza de Supabase Storage...');

  try {
    // Listar todos los reportes para obtener las carpetas (ya que se guardan como reportId/fileName)
    // El método list no es recursivo por defecto a menos que se especifique una ruta vacía y se manejen subcarpetas
    // Pero Storage v2 permite listar con search o limit.
    // Vamos a buscar todas las carpetas.
    const { data: folders, error: foldersError } = await supabase
      .storage
      .from('report_images')
      .list('', { limit: 1000 });

    if (foldersError) throw foldersError;

    let totalDeletedSize = 0;
    let filesToDelete = [];
    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);

    console.log(`Buscando archivos anteriores a: ${THIRTY_DAYS_AGO.toISOString()}`);

    // Buscar archivos dentro de cada carpeta
    for (const folder of folders) {
      if (!folder.id) {
        // Es un archivo en la raíz
        const createdAt = new Date(folder.created_at);
        if (createdAt < THIRTY_DAYS_AGO) {
          filesToDelete.push(folder.name);
          totalDeletedSize += folder.metadata?.size || 0;
        }
      } else {
        // Es una subcarpeta
        const { data: files, error: filesError } = await supabase
          .storage
          .from('report_images')
          .list(folder.name, { limit: 1000 });

        if (filesError) {
          console.error(`Error listando carpeta ${folder.name}:`, filesError);
          continue;
        }

        for (const file of files) {
          if (file.name === '.emptyFolderPlaceholder') continue;
          const createdAt = new Date(file.created_at);
          if (createdAt < THIRTY_DAYS_AGO) {
            filesToDelete.push(`${folder.name}/${file.name}`);
            totalDeletedSize += file.metadata?.size || 0;
          }
        }
      }
    }

    console.log(`Se encontraron ${filesToDelete.length} archivos antiguos para eliminar.`);
    console.log(`Espacio estimado a liberar: ${(totalDeletedSize / (1024 * 1024)).toFixed(2)} MB`);

    if (filesToDelete.length === 0) {
      console.log('No hay nada que eliminar.');
      return;
    }

    // Supabase permite eliminar en lotes (hasta 100 archivos)
    const batchSize = 100;
    for (let i = 0; i < filesToDelete.length; i += batchSize) {
      const batch = filesToDelete.slice(i, i + batchSize);
      const { data, error } = await supabase
        .storage
        .from('report_images')
        .remove(batch);
        
      if (error) {
        console.error(`Error eliminando lote ${i}:`, error);
      } else {
        console.log(`Eliminados ${data.length} archivos (Lote ${i/batchSize + 1}).`);
      }
    }

    console.log('Limpieza finalizada con éxito.');

  } catch (error) {
    console.error('Error durante la limpieza:', error);
  }
}

cleanup();
