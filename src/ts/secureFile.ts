/**
 * Devuelve la URL del archivo con el token JWT como query param.
 *
 * El backend require autenticación en /public/uploads/* pero el navegador
 * no puede enviar el header Authorization cuando carga archivos en
 * <iframe>, <embed>, <a href>, <img>, etc.
 * La solución: pasar el token como ?token=<jwt>.
 *
 * Uso:
 *   <iframe src={getSecureFileUrl(revision.thesis_dir)} />
 *   <a href={getSecureFileUrl(thesis_dir)} download>Descargar</a>
 */
export const getSecureFileUrl = (fileUrl: string | null | undefined): string => {
  if (!fileUrl) return '';
  const token = localStorage.getItem('authToken');
  if (!token) return fileUrl;

  // Evitar duplicar el token si ya viene en la URL
  if (fileUrl.includes('?token=')) return fileUrl;

  const separator = fileUrl.includes('?') ? '&' : '?';
  return `${fileUrl}${separator}token=${encodeURIComponent(token)}`;
};
