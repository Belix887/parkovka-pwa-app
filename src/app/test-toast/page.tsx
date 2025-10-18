"use client";
import { useToast } from "@/components/ui/ToastProvider";

export default function TestToastPage() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  return (
    <main className="container">
      <h1 className="text-2xl font-semibold mb-6">Тест уведомлений</h1>
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => showSuccess("Успех!", "Это уведомление об успехе")}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Показать успех
        </button>
        <button 
          onClick={() => showError("Ошибка!", "Это уведомление об ошибке")}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          Показать ошибку
        </button>
        <button 
          onClick={() => showInfo("Информация", "Это информационное уведомление")}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Показать информацию
        </button>
        <button 
          onClick={() => showWarning("Предупреждение", "Это предупреждение")}
          className="px-4 py-2 rounded bg-yellow-600 text-white"
        >
          Показать предупреждение
        </button>
      </div>
    </main>
  );
}
