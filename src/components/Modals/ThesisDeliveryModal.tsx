import React, { useState } from "react";
import Swal from "sweetalert2";
import { useProfile } from "../../context/UserProfileContext";
import { entregarTarea } from "../../ts/Students/DeliverTask";
import { FileText, CheckCircle, Loader2, UploadCloud, X } from "lucide-react";

interface ThesisDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  taskTitle: string;
}

const ThesisDeliveryModal: React.FC<ThesisDeliveryModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
}) => {
  const { profile } = useProfile();
  const userId = profile?.user_id ?? null;
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        Swal.fire({
          icon: "error",
          title: "Formato inválido",
          text: "Solo se permiten archivos PDF.",
          confirmButtonColor: "#ef4444",
          confirmButtonText: "De Acuerdo",
        });
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!pdfFile || !userId) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Debes seleccionar un archivo PDF antes de enviar.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      });
      return;
    }

    setLoading(true);
    try {
      await entregarTarea({
        user_id: userId,
        task_id: taskId,
        file: pdfFile,
      });

      Swal.fire({
        icon: "success",
        title: "¡Tesis entregada!",
        text: `La tesis "${taskTitle}" ha sido entregada exitosamente.`,
        confirmButtonColor: "#10b981",
        confirmButtonText: "De Acuerdo",
      });
      onClose();
      setPdfFile(null);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al entregar tesis",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "De Acuerdo",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
        {/* Cerrar modal */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Entregar - {taskTitle}
        </h2>

        {/* Subida de PDF */}
        <div className="mb-6">
          <label
            htmlFor="pdfFile"
            className="block text-lg font-semibold text-gray-700 dark:text-white mb-2"
          >
            <FileText className="inline-block h-5 w-5 mr-2 text-blue-500" />{" "}
            Archivo PDF
          </label>
          <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-all duration-300">
            <input
              type="file"
              id="pdfFile"
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center">
              {pdfFile ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pdfFile.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Archivo seleccionado
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-12 w-12 text-blue-500 mb-3" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    Arrastra y suelta tu PDF aquí
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    o haz clic para seleccionar
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Botón enviar */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || !pdfFile || !userId}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                       text-white font-medium rounded-xl transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-3" /> Enviando...
              </>
            ) : (
              "Entregar Capitulo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThesisDeliveryModal;
