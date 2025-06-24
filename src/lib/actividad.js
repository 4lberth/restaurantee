import { prisma } from '@/lib/prisma';

/**
 * Registra una nueva actividad en el sistema
 * @param {string} tipo - Tipo de actividad (mesa_creada, plato_actualizado, etc.)
 * @param {string} mensaje - Descripción de la actividad
 * @param {number|null} usuarioId - ID del usuario que realizó la acción (opcional)
 * @returns {Promise<Object>} - La actividad creada
 */
export async function registrarActividad(tipo, mensaje, usuarioId = null) {
  try {
    const actividad = await prisma.actividad.create({
      data: {
        tipo,
        mensaje,
        usuarioId
      }
    });
    
    return actividad;
  } catch (error) {
    // Si hay error, no detener el flujo principal
    console.error('Error al registrar actividad:', error);
    return null;
  }
}

/**
 * Obtiene las actividades más recientes
 * @param {number} limite - Número máximo de actividades a obtener
 * @returns {Promise<Array>} - Lista de actividades ordenadas por fecha descendente
 */
export async function obtenerActividadesRecientes(limite = 20) {
  try {
    const actividades = await prisma.actividad.findMany({
      orderBy: { createdAt: 'desc' },
      take: limite,
      include: {
        usuario: {
          select: { id: true, nombre: true, rol: true }
        }
      }
    });
    
    return actividades;
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return [];
  }
}